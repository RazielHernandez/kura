import { databaseService } from "../../DatabaseService";
import { itemRepository } from "../../repositories/ItemRepository";
import { tagRepository } from "../../repositories/TagRepository";
import { itemTagRepository } from "../../repositories/ItemTagRepository";

export interface SetItemTagsInput {
  itemId: string;
  tagIds: string[];
}

export class SetItemTagsUseCase {
  async execute(
    input: SetItemTagsInput
  ): Promise<void> {
    const itemId = input.itemId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    // Remove duplicate IDs.
    const tagIds = [
      ...new Set(
        input.tagIds
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    // Validate every tag before modifying anything.
    for (const tagId of tagIds) {
      const tag = await tagRepository.getById(tagId);

      if (!tag) {
        throw new Error(`Tag not found: ${tagId}`);
      }

      if (tag.collectionId !== item.collectionId) {
        throw new Error(
          `Tag ${tagId} does not belong to the item's collection`
        );
      }
    }

    await databaseService.transaction(async () => {
      await itemTagRepository.setTagsForItem(
        itemId,
        tagIds
      );
    });
  }
}

export const setItemTagsUseCase =
  new SetItemTagsUseCase();