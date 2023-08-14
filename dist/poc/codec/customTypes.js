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
exports.getType = exports.BlockHash = exports.BlockNumber = exports.Extrinsic = exports.StorageData = exports.StorageKey = void 0;
const $ = __importStar(require("scale-codec"));
const scale_codec_1 = require("scale-codec");
const metadata_1 = require("../metadata");
const bool = $.bool;
const Text = $.str;
const Hash = $.sizedUint8Array(256);
const Metadata = metadata_1.$metadata;
const Bytes = (0, scale_codec_1.createCodec)({
    _metadata: (0, scale_codec_1.metadata)('$.MyBytes'),
    _staticSize: 0,
    _encode(buffer, value) {
        buffer.insertArray(value);
    },
    _decode(buffer) {
        return buffer.array;
    },
    _assert(assert) {
        assert.instanceof(this, Uint8Array);
    }
});
exports.StorageKey = Bytes;
exports.StorageData = Bytes;
exports.Extrinsic = $.uint8Array;
exports.BlockNumber = $.compact($.u32);
exports.BlockHash = Hash;
const Header = $.object($.field('parentHash', Hash), $.field('number', exports.BlockNumber), $.field('stateRoot', Hash), $.field('extrinsicsRoot', Hash), $.field('digest', Bytes));
const getType = (typeName) => {
    const $type = TypesMap[typeName];
    if (!$type) {
        throw new Error(`Unsupported type - ${typeName}`);
    }
    return $type;
};
exports.getType = getType;
const TypesMap = {
    Bytes,
    bool,
    Text,
    Hash,
    Metadata,
    StorageKey: exports.StorageKey,
    StorageData: exports.StorageData,
    Header,
    BlockHash: exports.BlockHash,
    BlockNumber: exports.BlockNumber
};
exports.default = TypesMap;
