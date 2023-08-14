"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HASHERS = void 0;
const util_crypto_1 = require("@polkadot/util-crypto");
const util_1 = require("@polkadot/util");
exports.HASHERS = {
    'blake2_128': (data) => (0, util_crypto_1.blake2AsU8a)(data, 128),
    'blake2_256': (data) => (0, util_crypto_1.blake2AsU8a)(data, 256),
    'blake2_128Concat': (data) => (0, util_1.u8aConcat)((0, util_crypto_1.blake2AsU8a)(data, 128), (0, util_1.u8aToU8a)(data)),
    'twox128': (data) => (0, util_crypto_1.xxhashAsU8a)(data, 128),
    'twox256': (data) => (0, util_crypto_1.xxhashAsU8a)(data, 256),
    'twox64Concat': (data) => (0, util_1.u8aConcat)((0, util_crypto_1.xxhashAsU8a)(data, 64), (0, util_1.u8aToU8a)(data)),
    'identity': (data) => (0, util_1.u8aToU8a)(data),
};
