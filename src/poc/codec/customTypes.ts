import * as $ from "scale-codec"
import { AnyCodec, Codec, createCodec, metadata } from "scale-codec"
import { $metadata } from "../metadata";

const bool = $.bool;
const Text = $.str;
const Hash = $.sizedUint8Array(256);
const Metadata = $metadata;

const Bytes: Codec<Uint8Array> = createCodec({
  _metadata: metadata('$.MyBytes'),
  _staticSize: 0, // TODO determine this!
  _encode(buffer, value) {
    buffer.insertArray(value);
  },
  _decode(buffer) {
    return buffer.array;
  },
  _assert(assert) {
    assert.instanceof(this, Uint8Array)
  }
});

export const StorageKey = Bytes;
export const StorageData = Bytes;
export const Extrinsic = $.uint8Array;
export const BlockNumber = $.compact($.u32);

export type AnyU8a = Uint8Array | number[] | string;
export const BlockHash = Hash;

const Header = $.object(
  $.field('parentHash', Hash),
  $.field('number', BlockNumber),
  $.field('stateRoot', Hash),
  $.field('extrinsicsRoot', Hash),
  $.field('digest', Bytes),
)

export const getType = (typeName: string): AnyCodec => {
  const $type = TypesMap[typeName];
  if(!$type) {
    throw new Error(`Unsupported type - ${typeName}`);
  }

  return $type;
}

const TypesMap: Record<string, AnyCodec> = {
  Bytes,
  bool,
  Text,
  Hash,
  Metadata,
  StorageKey,
  StorageData,
  Header,
  BlockHash,
  BlockNumber
}

export default TypesMap;
