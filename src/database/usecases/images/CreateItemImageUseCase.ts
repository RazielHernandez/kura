import { ItemImage } from "../../models/ItemImage";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemImageRepository } from "../../repositories/ItemImageRepository";

export interface CreateItemImageInput {
  itemId: string;
  uri: string;
  thumbnailUri?: string | null;
  sortOrder?: number;
}

export class CreateItemImageUseCase {
  async execute(
    input: CreateItemImageInput
  ): Promise<ItemImage> {
    const itemId = input.itemId.trim();
    const uri = input.uri.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    if (!uri) {
      throw new Error("Image URI is required");
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

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return itemImageRepository.create(
      itemId,
      uri,
      {
        thumbnailUri:
          input.thumbnailUri?.trim() || null,
        sortOrder: input.sortOrder,
      }
    );
  }
}

export const createItemImageUseCase =
  new CreateItemImageUseCase();