"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodec = exports.normalizeIdent = exports.$null = void 0;
const $ = __importStar(require("scale-codec"));
exports.$null = $.withMetadata($.metadata("$null"), $.constant(null));
function normalizeIdent(ident) {
    if (ident.startsWith("r#"))
        ident = ident.slice(2);
    return ident.replace(/(?:[^\p{ID_Continue}]|_)+(.)/gu, (_, $1) => $1.toUpperCase());
}
exports.normalizeIdent = normalizeIdent;
const optionInnerVisitor = new $.CodecVisitor()
    .add($.option, (_codec, $some) => $some)
    .fallback(() => null);
function maybeOptionalField(key, $value) {
    const $inner = optionInnerVisitor.visit($value);
    return $inner ? $.optionalField(key, $inner) : $.field(key, $value);
}
const createCodec = (metadata, typeId) => {
    const def = metadata.tys[typeId];
    if (!def) {
        throw new Error(`Type id not found ${typeId}`);
    }
    // TODO implement alias
    if (def.type === 'Struct') {
        if (def.fields.length === 0) {
            return exports.$null;
        }
        else if (def.fields[0].name === undefined) {
            if (def.fields.length === 1) {
                // wrapper
                return (0, exports.createCodec)(metadata, def.fields[0].ty);
            }
            else {
                return $.tuple(...def.fields.map((x) => (0, exports.createCodec)(metadata, x.ty)));
            }
        }
        else {
            // TODO optional field
            return $.object(...def.fields.map((x) => maybeOptionalField(normalizeIdent(x.name), (0, exports.createCodec)(metadata, x.ty))));
        }
    }
    else if (def.type === 'Tuple') {
        if (def.fields.length === 0) {
            return exports.$null;
        }
        else if (def.fields.length === 1) {
            // wrapper
            return (0, exports.createCodec)(metadata, def.fields[0]);
        }
        else {
            return $.tuple(...def.fields.map((x) => (0, exports.createCodec)(metadata, x)));
        }
    }
    else if (def.type === "Union") {
        if (def.members.length === 0) {
            return $.never;
        }
        else if (def.members.every((x) => x.fields.length === 0)) {
            const members = {};
            for (const { index, name } of def.members) {
                members[index] = normalizeIdent(name);
            }
            return $.literalUnion(members);
        }
        else {
            const members = {};
            for (const { fields, name, index } of def.members) {
                let member;
                const type = normalizeIdent(name);
                if (fields.length === 0) {
                    member = $.variant(type);
                }
                else if (fields[0].name === undefined) {
                    // Tuple variant
                    const $value = fields.length === 1
                        ? (0, exports.createCodec)(metadata, fields[0].ty)
                        : $.tuple(...fields.map((f) => (0, exports.createCodec)(metadata, f.ty)));
                    member = $.variant(type, maybeOptionalField("value", $value));
                }
                else {
                    // Object variant
                    const memberFields = fields.map((field) => {
                        return maybeOptionalField(normalizeIdent(field.name), (0, exports.createCodec)(metadata, field.ty));
                    });
                    member = $.variant(type, ...memberFields);
                }
                members[index] = member;
            }
            return $.taggedUnion("type", members);
        }
    }
    else if (def.type === "Sequence") {
        const $inner = (0, exports.createCodec)(metadata, def.typeParam);
        if ($inner === $.u8) {
            return $.uint8Array;
        }
        else {
            return $.array($inner);
        }
    }
    else if (def.type === 'SizedArray') {
        const $inner = (0, exports.createCodec)(metadata, def.typeParam);
        if ($inner === $.u8) {
            return $.sizedUint8Array(def.len);
        }
        else {
            return $.sizedArray($inner, def.len);
        }
    }
    else if (def.type === 'Primitive') {
        if (def.kind === 'char') {
            return $.str;
        }
        return $[def.kind];
    }
    else if (def.type === 'Compact') {
        return $.compact((0, exports.createCodec)(metadata, def.typeParam));
    }
    else if (def.type === 'BitSequence') {
        return $.bitSequence;
    }
    throw Error(`Not support yet! ${JSON.stringify(def, null, 2)}`);
};
exports.createCodec = createCodec;
