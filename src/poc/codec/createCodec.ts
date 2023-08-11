import * as $ from "scale-codec";
import { Metadata } from "../metadata";

export const $null = $.withMetadata($.metadata("$null"), $.constant(null))

export function normalizeIdent(ident: string) {
  if (ident.startsWith("r#")) ident = ident.slice(2)
  return ident.replace(/(?:[^\p{ID_Continue}]|_)+(.)/gu, (_, $1: string) => $1.toUpperCase())
}

const optionInnerVisitor = new $.CodecVisitor<$.AnyCodec | null>()
  .add($.option, (_codec, $some) => $some)
  .fallback(() => null)

function maybeOptionalField(key: PropertyKey, $value: $.AnyCodec): $.AnyCodec {
  const $inner = optionInnerVisitor.visit($value)
  return $inner ? $.optionalField(key, $inner) : $.field(key, $value)
}


export const createCodec = (metadata: Metadata, typeId: number): $.AnyCodec => {
  const def = metadata.tys[typeId];

  if (!def) {
    throw new Error(`Type id not found ${typeId}`);
  }

  // TODO implement alias
  if (def.type === 'Struct') {
    if (def.fields.length === 0) {
      return $null;
    } else if (def.fields[0].name === undefined) {
      if (def.fields.length === 1) {
        // wrapper
        return createCodec(metadata, def.fields[0]!.ty)
      } else {
        return $.tuple(...def.fields.map((x) => createCodec(metadata, x.ty)))
      }
    } else {
      // TODO optional field
      return $.object(
        ...def.fields.map((x) => maybeOptionalField(normalizeIdent(x.name!), createCodec(metadata, x.ty))),
      )
    }
  } else if (def.type === 'Tuple') {
    if (def.fields.length === 0) {
      return $null
    } else if (def.fields.length === 1) {
      // wrapper
      return createCodec(metadata, def.fields[0]!)
    } else {
      return $.tuple(...def.fields.map((x) => createCodec(metadata, x)))
    }
  } else if (def.type === "Union") {
    if (def.members.length === 0) {
      return $.never as any
    } else if (def.members.every((x) => x.fields.length === 0)) {
      const members: Record<number, string> = {}
      for (const { index, name } of def.members) {
        members[index] = normalizeIdent(name)
      }
      return $.literalUnion(members)
    } else {
      const members: Record<number, $.Variant<any, any>> = {}
      for (const { fields, name, index } of def.members) {
        let member: $.Variant<any, any>
        const type = normalizeIdent(name)
        if (fields.length === 0) {
          member = $.variant(type)
        } else if (fields[0]!.name === undefined) {
          // Tuple variant
          const $value = fields.length === 1
            ? createCodec(metadata, fields[0]!.ty)
            : $.tuple(...fields.map((f) => createCodec(metadata, f.ty)))
          member = $.variant(type, maybeOptionalField("value", $value))
        } else {
          // Object variant
          const memberFields = fields.map((field) => {
            return maybeOptionalField(normalizeIdent(field.name!), createCodec(metadata, field.ty))
          })
          member = $.variant(type, ...memberFields)
        }
        members[index] = member
      }
      return $.taggedUnion("type", members)
    }
  } else if (def.type === "Sequence") {
    const $inner = createCodec(metadata, def.typeParam)
    if ($inner === $.u8) {
      return $.uint8Array
    } else {
      return $.array($inner)
    }
  } else if (def.type === 'SizedArray') {
    const $inner = createCodec(metadata, def.typeParam)
    if ($inner === $.u8) {
      return $.sizedUint8Array(def.len)
    } else {
      return $.sizedArray($inner, def.len)
    }
  } else if (def.type === 'Primitive') {
    if (def.kind === 'char') {
      return $.str;
    }

    return $[def.kind];
  } else if (def.type === 'Compact') {
    return $.compact(createCodec(metadata, def.typeParam))
  } else if (def.type === 'BitSequence') {
    return $.bitSequence;
  }

  throw Error(`Not support yet! ${JSON.stringify(def, null, 2)}`);
}
