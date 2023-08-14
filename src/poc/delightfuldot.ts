import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { hexToU8a, isHex, isString, isU8a, stringCamelCase, u8aConcat, u8aToHex, u8aToU8a } from '@polkadot/util';
import { decodeAddress, xxhashAsU8a } from '@polkadot/util-crypto';
import { IStorageEntry, Metadata } from "./metadata";
import { HASHERS } from "./codec/hashers";
import { WsProvider } from "@polkadot/rpc-provider";
import { CodecRegistry } from "./codec/registry";
import { AnyU8a } from "./codec/customTypes";
import { AnyString } from "@polkadot/util/types";

// ref: https://github.com/polkadot-js/api/blob/319535a1e938e89522ff18ef2d1cef66a5af597c/packages/types/src/generic/AccountId.ts#L11-L23
function decodeAccountId(value?: AnyU8a | AnyString): Uint8Array {
  if (isU8a(value) || Array.isArray(value)) {
    return u8aToU8a(value);
  } else if (!value) {
    return new Uint8Array();
  } else if (isHex(value)) {
    return hexToU8a(value);
  } else if (isString(value)) {
    return decodeAddress(value.toString());
  }

  throw new Error(`Unknown type passed to AccountId constructor, found typeof ${typeof value}`);
}

interface Carrier<T extends unknown = unknown> {
  executor: (...params: string[]) => T,
  chain: string[];
}

const chainedCallsProxy = (carrier: Carrier, currentLevel = 1, maxLevel = 2) => {
  const {executor, chain} = carrier;
  if (currentLevel === maxLevel) {
    return executor(...chain);
  }

  return new Proxy(carrier, {
    get(target: Carrier, property: string | symbol, receiver: any): any {
      const {chain} = target;
      chain.push(property.toString());

      return chainedCallsProxy(target, currentLevel + 1);
    }
  })
}

export class DelightfulApi {
  readonly #providerInterface: WsProvider;
  #metadata?: Metadata;
  #codecRegistry: CodecRegistry;

  private constructor(endpoint: string) {
    this.#providerInterface = new WsProvider(endpoint, 2_500, {}, 20_000);
    this.#codecRegistry = new CodecRegistry();
  }

  async init() {
    const rawMetadata: Metadata = await this.rpc.state.getMetadata();
    this.setMetadata(rawMetadata)
  }

  static async create(endpoint: string): Promise<DelightfulApi> {
    const api = new DelightfulApi(endpoint);

    await api.provider.isReady;
    await api.init();

    return api;
  }

  #newChainedProxy(executor: (...params: string[]) => unknown): any {
    return new Proxy(this, {
      get(target: DelightfulApi, property: string | symbol, receiver: any): any {
        return chainedCallsProxy({
          executor,
          chain: [property.toString()]
        });
      }
    });
  }

  public get rpc() {
    return this.#newChainedProxy(this.executeRpc.bind(this));
  }

  public get consts() {
    return this.#newChainedProxy(this.findConst.bind(this));
  }

  public get query() {
    return this.#newChainedProxy(this.executeQuery.bind(this));
  }

  executeRpc(section: string, method: string) {
    const def = jsonrpc[section][method];
    const rpcName = def.endpoint || `${section}_${method}`;

    const fnRpc = async (...inputs: unknown[]): Promise<unknown> => {
      if (def.params.length !== inputs.length && def.params.filter(param => !param.isOptional).length !== inputs.length) {
        // TODO check for optional
        throw new Error(`Miss match input length, required: ${JSON.stringify(def.params)}, current inputs: ${inputs.length}`);
      }

      const formattedInputs = inputs.map((input, index) => {
        // TODO verify & transform inputs type
        return u8aToHex(this.#codecRegistry.findCodec(def.params[index].type).encode(input));
      });

      //
      const result = await this.#providerInterface.send<any>(rpcName, formattedInputs);

      //TODO format with outputType
      if (isHex(result)) {
        const $outputType = this.#codecRegistry.findCodec(def.type);

        return $outputType.decode(hexToU8a(result));
      }

      return result;
    }

    return fnRpc;
  }

  findConst(pallet: string, name: string) {
    const targetPallet = this.metadata.pallets.find((p) => stringCamelCase(p.name) === pallet);
    if (!targetPallet) {
      return;
    }

    const targetEntry = targetPallet.constants.find((entry) => stringCamelCase(entry.name) === name);
    if (!targetEntry) {
      return;
    }

    const $codec = this.#codecRegistry.findPortableCodec(targetEntry.ty);

    return $codec.decode(targetEntry.value);
  }

  executeQuery(section: string, method: string) {
    return async (...args: unknown[]) => {
      const storageKeyFn = this.storageKey(section, method);
      const key = storageKeyFn(...args);
      const valueCodec = storageKeyFn.valueCodec;

      const result = await this.rpc.state.getStorage(hexToU8a(key));

      if (result === null || result.length === 0) {
        // TODO return default value
        return null;
      } else {
        return valueCodec.decode(u8aToU8a(result));
      }
    }
  }

  private getPallet(name: string) {
    const targetPallet = this.metadata.pallets.find((p) => stringCamelCase(p.name) === name);

    if (!targetPallet) {
      throw new Error('Pallet not found');
    }

    return targetPallet;
  }

  get metadata() {
    return this.#metadata!;
  }

  setMetadata(metadata: Metadata) {
    this.#metadata = metadata;
    this.#codecRegistry.setMetadata(this.#metadata);
  }

  get provider() {
    return this.#providerInterface;
  }

  storageKey(pallet: string, item: string) {
    const targetPallet = this.getPallet(pallet);

    const targetEntry = targetPallet.storage?.entries?.find((entry) => stringCamelCase(entry.name) === item);
    if (!targetEntry) {
      throw new Error('Item not found');
    }

    const fn = (...args: unknown[]) => {
      const palletNameHash = xxhashAsU8a(targetPallet.name, 128);
      const entryNameHash = xxhashAsU8a(targetEntry.name, 128);

      const params = this.transformStorageQueryInputs(args, targetEntry);

      const {type} = targetEntry;

      if (type === 'Plain') {
        return u8aToHex(u8aConcat(palletNameHash, entryNameHash));
      } else if (type === 'Map') {
        const {hashers, key} = targetEntry;
        if (hashers.length === 1) {
          let input = params[0];

          const $keyCodec = this.#codecRegistry.findPortableCodec(key);

          // @ts-ignore
          fn.keyCodec = $keyCodec;

          const inputHash = HASHERS[hashers[0]]($keyCodec.encode(input));
          return u8aToHex(u8aConcat(palletNameHash, entryNameHash, inputHash))
        } else {
          throw Error('// TODO To implement!')
        }
      }

      throw Error('Invalid type');
    }

    fn.targetEntry = targetEntry;
    fn.valueCodec = this.#codecRegistry.findPortableCodec(targetEntry.value);
    fn.valueTypeId = targetEntry.value;

    return fn;
  }

  transformStorageQueryInputs = (params: unknown[], storageEntry: IStorageEntry): unknown[] => {
    const {type} = storageEntry;

    if (type === 'Plain') {
      if (params.length > 0) {
        throw new Error('This call does not require any params');
      }

      return params;
    } else if (type === 'Map') {
      const {hashers, key} = storageEntry;
      if (hashers.length === 1) {

        if (params.length !== 1) {
          throw new Error('Params length does match!');
        }

        let input = params[0];

        const def = this.metadata.tys[key];
        if (def.path.includes('AccountId32')) {
          input = decodeAccountId(input as any);
        }
        // TODO add more on this!!!

        return [input];
      } else {
        // TODO implement the transformation
        return params;
      }
    }

    throw new Error('Invalid storage entry type!');
  }

  async disconnect() {
    await this.provider.disconnect();
  }
}

