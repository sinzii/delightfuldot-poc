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
exports.$type = exports.$typeDef = exports.$primitiveKind = exports.$field = exports.$typeId = void 0;
const $ = __importStar(require("scale-codec"));
exports.$typeId = $.compact($.u32);
exports.$field = $.object($.optionalField("name", $.str), $.field("ty", exports.$typeId), $.optionalField("typeName", $.str), $.field("docs", $.array($.str)));
exports.$primitiveKind = $.literalUnion([
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
]);
exports.$typeDef = $.taggedUnion("type", [
    $.variant("Struct", $.field("fields", $.array(exports.$field))),
    $.variant("Union", $.field("members", $.array($.object($.field("name", $.str), $.field("fields", $.array(exports.$field)), $.field("index", $.u8), $.field("docs", $.array($.str)))))),
    $.variant("Sequence", $.field("typeParam", exports.$typeId)),
    $.variant("SizedArray", $.field("len", $.u32), $.field("typeParam", exports.$typeId)),
    $.variant("Tuple", $.field("fields", $.array(exports.$typeId))),
    $.variant("Primitive", $.field("kind", exports.$primitiveKind)),
    $.variant("Compact", $.field("typeParam", exports.$typeId)),
    $.variant("BitSequence", $.field("bitOrderType", exports.$typeId), $.field("bitStoreType", exports.$typeId)),
]);
exports.$type = $.object($.field("id", $.compact($.u32)), $.field("path", $.array($.str)), $.field("params", $.array($.object($.field("name", $.str), $.optionalField("ty", exports.$typeId)))), exports.$typeDef, $.field("docs", $.array($.str)));
