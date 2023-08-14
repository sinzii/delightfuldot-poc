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
exports.decodeMetadata = exports.$metadata = void 0;
const $ = __importStar(require("scale-codec"));
const types_1 = require("./types");
const $hasher = $.literalUnion([
    "blake2_128",
    "blake2_256",
    "blake2_128Concat",
    "twox128",
    "twox256",
    "twox64Concat",
    "identity",
]);
const $storageEntry = $.object($.field("name", $.str), $.field("modifier", $.literalUnion(["Optional", "Default"])), $.taggedUnion("type", [
    $.variant("Plain", $.field("value", types_1.$typeId)),
    $.variant("Map", $.field("hashers", $.array($hasher)), $.field("key", types_1.$typeId), $.field("value", types_1.$typeId)),
]), $.field("default", $.uint8Array), $.field("docs", $.array($.str)));
const $constant = $.object($.field("name", $.str), $.field("ty", types_1.$typeId), $.field("value", $.uint8Array), $.field("docs", $.array($.str)));
const $pallet = $.object($.field("name", $.str), $.optionalField("storage", $.object($.field("prefix", $.str), $.field("entries", $.array($storageEntry)))), $.optionalField("calls", types_1.$typeId), $.optionalField("event", types_1.$typeId), $.field("constants", $.array($constant)), $.optionalField("error", types_1.$typeId), $.field("index", $.u8));
const $extrinsicDef = $.object($.field("ty", types_1.$typeId), $.field("version", $.u8), $.field("signedExtensions", $.array($.object($.field("ident", $.str), $.field("ty", types_1.$typeId), $.field("additionalSigned", types_1.$typeId)))));
const MAGIC_NUMBER = 1635018093;
exports.$metadata = $.object($.field("magicNumber", $.constant(MAGIC_NUMBER, $.u32)), $.field("version", $.constant(14, $.u8)), $.field("tys", $.array(types_1.$type)), $.field("pallets", $.array($pallet)), $.field("extrinsic", $extrinsicDef), $.field("runtimeType", types_1.$typeId));
function decodeMetadata(encoded) {
    return exports.$metadata.decode(encoded);
}
exports.decodeMetadata = decodeMetadata;
