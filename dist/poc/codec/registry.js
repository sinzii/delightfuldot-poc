"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodecRegistry = void 0;
const customTypes_1 = require("./customTypes");
const createCodec_1 = require("./createCodec");
class CodecRegistry {
    #metadata;
    constructor() {
    }
    findCodec(name) {
        return (0, customTypes_1.getType)(name);
    }
    findPortableCodec(typeId) {
        if (!this.#metadata) {
            throw new Error('Metadata is not available!');
        }
        return (0, createCodec_1.createCodec)(this.#metadata, typeId);
    }
    setMetadata(metadata) {
        this.#metadata = metadata;
    }
}
exports.CodecRegistry = CodecRegistry;
