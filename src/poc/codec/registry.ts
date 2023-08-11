import { getType } from "./customTypes";
import { AnyCodec } from "scale-codec";
import { Metadata } from "../metadata";
import { createCodec } from "./createCodec";

export class CodecRegistry {
  #metadata?: Metadata;

  constructor() {
  }

  findCodec(name: string): AnyCodec {
    return getType(name)
  }

  findPortableCodec(typeId: number) {
    if (!this.#metadata) {
      throw new Error('Metadata is not available!');
    }

    return createCodec(this.#metadata, typeId);

  }

  setMetadata(metadata: Metadata) {
    this.#metadata = metadata;
  }
}
