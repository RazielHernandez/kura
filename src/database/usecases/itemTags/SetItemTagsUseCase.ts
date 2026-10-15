
import { databaseService } from "../../DatabaseService";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemTagRepository } from "../../repositories/ItemTagRepository";
import { validateItemTagsUseCase } from "../items/ValidateItemTagsUseCase";

export interface SetItemTagsInput {
  itemId: string;
  tagIds: string[];
}

export class SetItemTagsUseCase {
  async execute(input: SetItemTagsInput): Promise<void> {
    const itemId = input.itemId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    if (!Array.isArray(input.tagIds)) {
      throw new Error("Tag IDs must be an array");
    }

    const tagIds = input.tagIds.map((id) =>
      typeof id === "string" ? id.trim() : ""
    );

    if (tagIds.some((id) => !id)) {
      throw new Error("Tag IDs cannot be empty");
    }

    if (new Set(tagIds).size !== tagIds.length) {
      throw new Error("Duplicate tag IDs are not allowed");
    }

    await databaseService.transaction(async () => {
      const item = await itemRepository.getById(itemId);

      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      await validateItemTagsUseCase.execute({
        collectionId: item.collectionId,
        tagIds,
      });

      await itemTagRepository.setTagsForItem(itemId, tagIds);
    });
  }
}

export const setItemTagsUseCase = new SetItemTagsUseCase();
