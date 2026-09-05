import { itemRepository } from "../../repositories/ItemRepository";
import { tagRepository } from "../../repositories/TagRepository";
import { itemTagRepository } from "../../repositories/ItemTagRepository";

export interface RemoveTagFromItemInput {
  itemId: string;
  tagId: string;
}

export class RemoveTagFromItemUseCase {
  async execute(
    input: RemoveTagFromItemInput
  ): Promise<void> {
    const itemId = input.itemId.trim();
    const tagId = input.tagId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    if (!tagId) {
      throw new Error("Tag ID is required");
    }

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const tag = await tagRepository.getById(tagId);

    if (!tag) {
      throw new Error(`Tag not found: ${tagId}`);
    }

    if (tag.collectionId !== item.collectionId) {
      throw new Error(
        "The tag does not belong to the item's collection"
      );
    }

    await itemTagRepository.remove(itemId, tagId);
  }
}

export const removeTagFromItemUseCase =
  new RemoveTagFromItemUseCase();