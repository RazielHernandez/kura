
import { databaseService } from "../../../DatabaseService";

import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

export interface ReorderItemImagesWorkflowInput {
  itemId: string;
  imageIds: string[];
}

export class ReorderItemImagesWorkflow {
  async execute(
    input: ReorderItemImagesWorkflowInput
  ): Promise<void> {
    const itemId = input.itemId.trim();

    if (!itemId) {
      throw new Error("Item ID is required.");
    }

    if (!Array.isArray(input.imageIds)) {
      throw new Error("Image IDs must be an array.");
    }

    const imageIds = input.imageIds.map(id => id.trim());

    if (imageIds.some(id => !id)) {
      throw new Error("Image IDs cannot be empty.");
    }

    return databaseService.transaction(async () => {
      /*
       * Verify that the item exists.
       */

      const item = await itemRepository.getById(itemId);

      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      /*
       * Reorder all images.
       */

      await itemImageRepository.reorderAll(
        itemId,
        imageIds
      );
    });
  }
}

export const reorderItemImagesWorkflow = new ReorderItemImagesWorkflow();
