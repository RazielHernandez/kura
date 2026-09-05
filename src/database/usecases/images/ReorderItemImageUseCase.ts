import { ItemImage } from "../../models/ItemImage";
import { itemImageRepository } from "../../repositories/ItemImageRepository";

export interface ReorderItemImageInput {
  id: string;
  sortOrder: number;
}

export class ReorderItemImageUseCase {
  async execute(
    input: ReorderItemImageInput
  ): Promise<ItemImage> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Image ID is required");
    }

    if (
      !Number.isInteger(input.sortOrder) ||
      input.sortOrder < 0
    ) {
      throw new Error(
        "Image sort order must be a non-negative integer"
      );
    }

    const existing = await itemImageRepository.getById(id);

    if (!existing) {
      throw new Error(`Image not found: ${id}`);
    }

    const updated = await itemImageRepository.reorder(
      id,
      input.sortOrder
    );

    if (!updated) {
      throw new Error(`Image could not be reordered: ${id}`);
    }

    return updated;
  }
}

export const reorderItemImageUseCase =
  new ReorderItemImageUseCase();