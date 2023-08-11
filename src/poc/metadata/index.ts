import * as $ from "scale-codec"
import { $type, $typeId } from "./types"

const $hasher = $.literalUnion([
  "blake2_128",
  "blake2_256",
  "blake2_128Concat",
  "twox128",
  "twox256",
  "twox64Concat",
  "identity",
])

const $storageEntry = $.object(
  $.field("name", $.str),
  $.field("modifier", $.literalUnion(["Optional", "Default"])),
  $.taggedUnion("type", [
    $.variant("Plain", $.field("value", $typeId)),
    $.variant(
      "Map",
      $.field("hashers", $.array($hasher)),
      $.field("key", $typeId),
      $.field("value", $typeId),
    ),
  ]),
  $.field("default", $.uint8Array),
  $.field("docs", $.array($.str)),
)

export type IStorageEntry = $.Native<typeof $storageEntry>;

const $constant = $.object(
  $.field("name", $.str),
  $.field("ty", $typeId),
  $.field("value", $.uint8Array),
  $.field("docs", $.array($.str)),
)

const $pallet = $.object(
  $.field("name", $.str),
  $.optionalField(
    "storage",
    $.object(
      $.field("prefix", $.str),
      $.field("entries", $.array($storageEntry)),
    ),
  ),
  $.optionalField("calls", $typeId),
  $.optionalField("event", $typeId),
  $.field("constants", $.array($constant)),
  $.optionalField("error", $typeId),
  $.field("index", $.u8),
)

const $extrinsicDef = $.object(
  $.field("ty", $typeId),
  $.field("version", $.u8),
  $.field(
    "signedExtensions",
    $.array($.object(
      $.field("ident", $.str),
      $.field("ty", $typeId),
      $.field("additionalSigned", $typeId),
    )),
  ),
)

const MAGIC_NUMBER = 1635018093

export const $metadata = $.object(
  $.field("magicNumber", $.constant<typeof MAGIC_NUMBER>(MAGIC_NUMBER, $.u32)),
  $.field("version", $.constant<14>(14, $.u8)),
  $.field("tys", $.array($type)),
  $.field("pallets", $.array($pallet)),
  $.field("extrinsic", $extrinsicDef),
  $.field("runtimeType", $typeId),
)

// export const $metadata = $.object(
//   $.field("MAGIC_NUMBER", $.constant<typeof MAGIC_NUMBER>(MAGIC_NUMBER, $.u32)),
//   $.taggedUnion("versionedMetadata", [
//     $.variant("V0", $.field("bytes", $.array($.u8))),
//     $.variant("V1", $.field("bytes", $.array($.u8))),
//     $.variant("V2", $.field("bytes", $.array($.u8))),
//     $.variant("V3", $.field("bytes", $.array($.u8))),
//     $.variant("V4", $.field("bytes", $.array($.u8))),
//     $.variant("V5", $.field("bytes", $.array($.u8))),
//     $.variant("V6", $.field("bytes", $.array($.u8))),
//     $.variant("V7", $.field("bytes", $.array($.u8))),
//     $.variant("V8", $.field("bytes", $.array($.u8))),
//     $.variant("V9", $.field("bytes", $.array($.u8))),
//     $.variant("V10", $.field("bytes", $.array($.u8))),
//     $.variant("V11", $.field("bytes", $.array($.u8))),
//     $.variant("V12", $.field("bytes", $.array($.u8))),
//     $.variant("V13", $.field("bytes", $.array($.u8))),
//     $.variant("V14",
//       $.field("types", $.array($ty)),
//       $.field("pallets", $.array($pallet)),
//       $.field("extrinsic", $extrinsicDef),
//       $.field("runtimeType", $typeId),),
//   ]),
// )

export type Metadata = $.Native<typeof $metadata>

export function decodeMetadata(encoded: Uint8Array) {
  return $metadata.decode(encoded)
}


