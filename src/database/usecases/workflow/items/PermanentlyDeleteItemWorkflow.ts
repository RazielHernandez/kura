import { databaseService } from "../../../DatabaseService";

import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemRepository } from "../../../repositories/ItemRepository";
import { collectionDeletionRepository } from "../../../repositories/CollectionDeletionRepository";

import { imageStorageService } from "../../../services/ImageStorageService";

import { permanentlyDeleteItemUseCase } from "../../items/PermanentlyDeleteItemUseCase";

interface IdRow {
  id: string;
}

async function getIds(
  sql: string,
  params: string[]
): Promise<string[]> {
  const rows = await databaseService.query<IdRow>(
    sql,
    params
  );

  return rows.map(row => row.id);
}

export class PermanentlyDeleteItemWorkflow {
  async execute(itemId: string): Promise<void> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required");
    }

    // Keep image information before the database cascade deletes it.
    const images =
      await itemImageRepository.getAllByItemIdIncludingDeleted(id);

    await databaseService.transaction(async () => {
      const existing =
        await itemRepository.getByIdIncludingDeleted(id);

      if (!existing) {
        throw new Error("Item not found");
      }

      // Collect all dependent IDs, including soft-deleted records.
      const itemValueIds = await getIds(
        `SELECT id FROM item_values WHERE itemId = ?`,
        [id]
      );

      const itemImageIds = await getIds(
        `SELECT id FROM item_images WHERE itemId = ?`,
        [id]
      );

      const itemNoteIds = await getIds(
        `SELECT id FROM item_notes WHERE itemId = ?`,
        [id]
      );

      // Remove references from an active collection deletion snapshot.
      await collectionDeletionRepository.removeItemReferences({
        collectionId: existing.collectionId,
        itemId: id,
        itemValueIds,
        itemImageIds,
        itemNoteIds,
      });

      // Permanently delete the item and its dependent database records.
      await permanentlyDeleteItemUseCase.execute(id);
    });

    // Delete physical files only after the database transaction succeeds.
    const cleanupResults = await Promise.allSettled(
      images.map(image =>
        imageStorageService.deleteImage(
          image.uri,
          image.thumbnailUri
        )
      )
    );

    const failedCleanups = cleanupResults.filter(
      result => result.status === "rejected"
    );

    if (failedCleanups.length > 0) {
      throw new Error(
        `Item was permanently deleted, but ${failedCleanups.length} image cleanup operation(s) failed.`
      );
    }
  }
}

export const permanentlyDeleteItemWorkflow = new PermanentlyDeleteItemWorkflow();