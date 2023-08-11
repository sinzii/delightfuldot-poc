import * as $ from "scale-codec"

export const $typeId = $.compact($.u32)

export const $field = $.object(
  $.optionalField("name", $.str),
  $.field("ty", $typeId),
  $.optionalField("typeName", $.str),
  $.field("docs", $.array($.str)),
)

export const $primitiveKind = $.literalUnion([
    "bool",
    "char",
    "str",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "u256",
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "i256",
])

export const $typeDef = $.taggedUnion("type", [
    $.variant("Struct", $.field("fields", $.array($field))),
    $.variant(
      "Union",
      $.field(
        "members",
        $.array($.object(
          $.field("name", $.str),
          $.field("fields", $.array($field)),
          $.field("index", $.u8),
          $.field("docs", $.array($.str)),
        )),
      ),
    ),
    $.variant("Sequence", $.field("typeParam", $typeId)),
    $.variant("SizedArray", $.field("len", $.u32), $.field("typeParam", $typeId)),
    $.variant("Tuple", $.field("fields", $.array($typeId))),
    $.variant("Primitive", $.field("kind", $primitiveKind)),
    $.variant("Compact", $.field("typeParam", $typeId)),
    $.variant("BitSequence", $.field("bitOrderType", $typeId), $.field("bitStoreType", $typeId)),
])

export type Type = $.Native<typeof $type>
export const $type = $.object(
  $.field("id", $.compact($.u32)),
  $.field("path", $.array($.str)),
  $.field(
    "params",
    $.array($.object(
      $.field("name", $.str),
      $.optionalField("ty", $typeId),
    )),
  ),
  $typeDef,
  $.field("docs", $.array($.str)),
)
