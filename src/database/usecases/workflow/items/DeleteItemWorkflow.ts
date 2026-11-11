
import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";

import { deleteItemUseCase } from "../../items/DeleteItemUseCase";

import { imageStorageService } from "../../../services/ImageStorageService";

export class DeleteItemWorkflow {
  async execute(itemId: string): Promise<void> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required.");
    }

    // Retrieve the item and all its image records before deletion.
    const currentItem = await itemRepository.getById(id);

    if (!currentItem) {
      throw new Error("Item not found.");
    }

    const images =
      await itemImageRepository.getAllByItemIdIncludingDeleted(id);

    // Keep all database changes atomic.
    await databaseService.transaction(async () => {
      await deleteItemUseCase.execute(id);

      await itemImageRepository.deleteByItemId(id);

      await itemHistoryRepository.create(
        currentItem.id,
        "DELETED",
        `Item "${currentItem.name}" was deleted`
      );
    });

    // Clean up physical files after the transaction succeeds.
    const cleanupErrors: unknown[] = [];

    for (const image of images) {
      try {
        await imageStorageService.deleteImage(
          image.uri,
          image.thumbnailUri
        );
      } catch (error) {
        cleanupErrors.push(error);
      }
    }

    if (cleanupErrors.length > 0) {
      throw new Error(
        `Item was deleted, but file cleanup failed for ${cleanupErrors.length} image(s).`
      );
    }
  }
}

export const deleteItemWorkflow = new DeleteItemWorkflow();
