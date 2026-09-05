import { ItemImage } from "../../models/ItemImage";
import { itemImageRepository } from "../../repositories/ItemImageRepository";

export interface UpdateItemImageInput {
  id: string;
  uri?: string;
  thumbnailUri?: string | null;
  sortOrder?: number;
}

export class UpdateItemImageUseCase {
  async execute(
    input: UpdateItemImageInput
  ): Promise<ItemImage> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Image ID is required");
    }

    if (
      input.uri !== undefined &&
      !input.uri.trim()
    ) {
      throw new Error("Image URI cannot be empty");
    }

    if (
      input.sortOrder !== undefined &&
      (!Number.isInteger(input.sortOrder) ||
        input.sortOrder < 0)
    ) {
      throw new Error(
        "Image sort order must be a non-negative integer"
      );
    }

    const existing = await itemImageRepository.getById(id);

    if (!existing) {
      throw new Error(`Image not found: ${id}`);
    }

    const updated = await itemImageRepository.update(
      id,
      {
        uri: input.uri?.trim(),
        thumbnailUri:
          input.thumbnailUri === undefined
            ? undefined
            : input.thumbnailUri?.trim() || null,
        sortOrder: input.sortOrder,
      }
    );

    if (!updated) {
      throw new Error(`Image could not be updated: ${id}`);
    }

    return updated;
  }
}

export const updateItemImageUseCase =
  new UpdateItemImageUseCase();