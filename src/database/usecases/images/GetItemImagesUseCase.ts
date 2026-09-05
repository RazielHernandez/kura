import { ItemImage } from "../../models/ItemImage";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemImageRepository } from "../../repositories/ItemImageRepository";

export class GetItemImagesUseCase {
  async execute(
    itemId: string
  ): Promise<ItemImage[]> {
    const normalizedItemId = itemId.trim();

    if (!normalizedItemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(
      normalizedItemId
    );

    if (!item) {
      throw new Error(
        `Item not found: ${normalizedItemId}`
      );
    }

    return itemImageRepository.getByItemId(
      normalizedItemId
    );
  }
}

export const getItemImagesUseCase =
  new GetItemImagesUseCase();