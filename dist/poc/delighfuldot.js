"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelightfulApi = void 0;
const jsonrpc_1 = __importDefault(require("@polkadot/types/interfaces/jsonrpc"));
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
const hashers_1 = require("./codec/hashers");
const rpc_provider_1 = require("@polkadot/rpc-provider");
const registry_1 = require("./codec/registry");
// ref: https://github.com/polkadot-js/api/blob/319535a1e938e89522ff18ef2d1cef66a5af597c/packages/types/src/generic/AccountId.ts#L11-L23
function decodeAccountId(value) {
    if ((0, util_1.isU8a)(value) || Array.isArray(value)) {
        return (0, util_1.u8aToU8a)(value);
    }
    else if (!value) {
        return new Uint8Array();
    }
    else if ((0, util_1.isHex)(value)) {
        return (0, util_1.hexToU8a)(value);
    }
    else if ((0, util_1.isString)(value)) {
        return (0, util_crypto_1.decodeAddress)(value.toString());
    }
    throw new Error(`Unknown type passed to AccountId constructor, found typeof ${typeof value}`);
}
const chainedCallsProxy = (carrier, currentLevel = 1, maxLevel = 2) => {
    const { executor, chain } = carrier;
    if (currentLevel === maxLevel) {
        return executor(...chain);
    }
    return new Proxy(carrier, {
        get(target, property, receiver) {
            const { chain } = target;
            chain.push(property.toString());
            return chainedCallsProxy(target, currentLevel + 1);
        }
    });
};
class DelightfulApi {
    #providerInterface;
    #metadata;
    #codecRegistry;
    constructor(endpoint) {
        this.#providerInterface = new rpc_provider_1.WsProvider(endpoint, 2_500, {}, 20_000);
        this.#codecRegistry = new registry_1.CodecRegistry();
    }
    async init() {
        const rawMetadata = await this.rpc.state.getMetadata();
        this.setMetadata(rawMetadata);
    }
    static async create(endpoint) {
        const api = new DelightfulApi(endpoint);
        await api.provider.isReady;
        await api.init();
        return api;
    }
    #newChainedProxy(executor) {
        return new Proxy(this, {
            get(target, property, receiver) {
                return chainedCallsProxy({
                    executor,
                    chain: [property.toString()]
                });
            }
        });
    }
    get rpc() {
        return this.#newChainedProxy(this.executeRpc.bind(this));
    }
    get consts() {
        return this.#newChainedProxy(this.findConst.bind(this));
    }
    get query() {
        return this.#newChainedProxy(this.executeQuery.bind(this));
    }
    executeRpc(section, method) {
        const def = jsonrpc_1.default[section][method];
        const rpcName = def.endpoint || `${section}_${method}`;
        const fnRpc = async (...inputs) => {
            if (def.params.length !== inputs.length && def.params.filter(param => !param.isOptional).length !== inputs.length) {
                // TODO check for optional
                throw new Error(`Miss match input length, required: ${JSON.stringify(def.params)}, current inputs: ${inputs.length}`);
            }
            const formattedInputs = inputs.map((input, index) => {
                // TODO verify & transform inputs type
                return (0, util_1.u8aToHex)(this.#codecRegistry.findCodec(def.params[index].type).encode(input));
            });
            //
            const result = await this.#providerInterface.send(rpcName, formattedInputs);
            //TODO format with outputType
            if ((0, util_1.isHex)(result)) {
                const $outputType = this.#codecRegistry.findCodec(def.type);
                return $outputType.decode((0, util_1.hexToU8a)(result));
            }
            return result;
        };
        return fnRpc;
    }
    findConst(pallet, name) {
        const targetPallet = this.metadata.pallets.find((p) => (0, util_1.stringCamelCase)(p.name) === pallet);
        if (!targetPallet) {
            return;
        }
        const targetEntry = targetPallet.constants.find((entry) => (0, util_1.stringCamelCase)(entry.name) === name);
        if (!targetEntry) {
            return;
        }
        const $codec = this.#codecRegistry.findPortableCodec(targetEntry.ty);
        return $codec.decode(targetEntry.value);
    }
    executeQuery(section, method) {
        return async (...args) => {
            const storageKeyFn = this.storageKey(section, method);
            const key = storageKeyFn(...args);
            const valueCodec = storageKeyFn.valueCodec;
            const result = await this.rpc.state.getStorage((0, util_1.hexToU8a)(key));
            if (result === null || result.length === 0) {
                // TODO return default value
                return null;
            }
            else {
                return valueCodec.decode((0, util_1.u8aToU8a)(result));
            }
        };
    }
    getPallet(name) {
        const targetPallet = this.metadata.pallets.find((p) => (0, util_1.stringCamelCase)(p.name) === name);
        if (!targetPallet) {
            throw new Error('Pallet not found');
        }
        return targetPallet;
    }
    get metadata() {
        return this.#metadata;
    }
    setMetadata(metadata) {
        this.#metadata = metadata;
        this.#codecRegistry.setMetadata(this.#metadata);
    }
    get provider() {
        return this.#providerInterface;
    }
    storageKey(pallet, item) {
        const targetPallet = this.getPallet(pallet);
        const targetEntry = targetPallet.storage?.entries?.find((entry) => (0, util_1.stringCamelCase)(entry.name) === item);
        if (!targetEntry) {
            throw new Error('Item not found');
        }
        const fn = (...args) => {
            const palletNameHash = (0, util_crypto_1.xxhashAsU8a)(targetPallet.name, 128);
            const entryNameHash = (0, util_crypto_1.xxhashAsU8a)(targetEntry.name, 128);
            const params = this.transformStorageQueryInputs(args, targetEntry);
            const { type } = targetEntry;
            if (type === 'Plain') {
                return (0, util_1.u8aToHex)((0, util_1.u8aConcat)(palletNameHash, entryNameHash));
            }
            else if (type === 'Map') {
                const { hashers, key } = targetEntry;
                if (hashers.length === 1) {
                    let input = params[0];
                    const $keyCodec = this.#codecRegistry.findPortableCodec(key);
                    // @ts-ignore
                    fn.keyCodec = $keyCodec;
                    const inputHash = hashers_1.HASHERS[hashers[0]]($keyCodec.encode(input));
                    return (0, util_1.u8aToHex)((0, util_1.u8aConcat)(palletNameHash, entryNameHash, inputHash));
                }
                else {
                    throw Error('// TODO To implement!');
                }
            }
            throw Error('Invalid type');
        };
        fn.targetEntry = targetEntry;
        fn.valueCodec = this.#codecRegistry.findPortableCodec(targetEntry.value);
        fn.valueTypeId = targetEntry.value;
        return fn;
    }
    transformStorageQueryInputs = (params, storageEntry) => {
        const { type } = storageEntry;
        if (type === 'Plain') {
            if (params.length > 0) {
                throw new Error('This call does not require any params');
            }
            return params;
        }
        else if (type === 'Map') {
            const { hashers, key } = storageEntry;
            if (hashers.length === 1) {
                if (params.length !== 1) {
                    throw new Error('Params length does match!');
                }
                let input = params[0];
                const def = this.metadata.tys[key];
                if (def.path.includes('AccountId32')) {
                    input = decodeAccountId(input);
                }
                // TODO add more on this!!!
                return [input];
            }
            else {
                // TODO implement the transformation
                return params;
            }
        }
        throw new Error('Invalid storage entry type!');
    };
    async disconnect() {
        await this.provider.disconnect();
    }
}
exports.DelightfulApi = DelightfulApi;
