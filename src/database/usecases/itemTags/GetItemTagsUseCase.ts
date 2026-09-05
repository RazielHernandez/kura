import { Tag } from "../../models/Tag";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemTagRepository } from "../../repositories/ItemTagRepository";

export class GetItemTagsUseCase {
  async execute(
    itemId: string
  ): Promise<Tag[]> {
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

    return itemTagRepository.getTagsByItemId(
      normalizedItemId
    );
  }
}

export const getItemTagsUseCase =
  new GetItemTagsUseCase();