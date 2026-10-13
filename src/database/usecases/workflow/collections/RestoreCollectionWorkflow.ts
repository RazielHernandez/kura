import { databaseService } from "../../../DatabaseService";
import { collectionRepository } from "../../../repositories/CollectionRepository";
import { collectionDeletionRepository } from "../../../repositories/CollectionDeletionRepository";

async function restoreIds(
  table: string,
  ids: string[],
  timestamp: string
): Promise<void> {
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(", ");

  await databaseService.execute(
    `
    UPDATE ${table}
    SET deletedAt = NULL, updatedAt = ?
    WHERE id IN (${placeholders})
      AND deletedAt IS NOT NULL
    `,
    [timestamp, ...ids]
  );
}

export class RestoreCollectionWorkflow {
  async execute(collectionId: string): Promise<void> {
    const collection =
      await collectionRepository.getByIdIncludingDeleted(
        collectionId
      );

    if (!collection) {
      throw new Error("Collection not found");
    }

    if (!collection.deletedAt) {
      throw new Error("Collection is not deleted");
    }

    await databaseService.transaction(async () => {
      const deletion =
        await collectionDeletionRepository
          .getActiveByCollectionId(collectionId);

      if (!deletion) {
        throw new Error(
          "Collection deletion record not found"
        );
      }

      const timestamp = new Date().toISOString();

      // Restore the collection first. All changes remain inside
      // the transaction until the entire workflow completes.
      await databaseService.execute(
        `
        UPDATE collections
        SET deletedAt = NULL, updatedAt = ?
        WHERE id = ?
          AND deletedAt IS NOT NULL
        `,
        [timestamp, collectionId]
      );

      await restoreIds(
        "collection_fields",
        deletion.collectionFieldIds,
        timestamp
      );

      await restoreIds(
        "items",
        deletion.itemIds,
        timestamp
      );

      await restoreIds(
        "item_values",
        deletion.itemValueIds,
        timestamp
      );

      await restoreIds(
        "item_images",
        deletion.itemImageIds,
        timestamp
      );

      await restoreIds(
        "item_notes",
        deletion.itemNoteIds,
        timestamp
      );

      await restoreIds(
        "tags",
        deletion.tagIds,
        timestamp
      );

      await collectionDeletionRepository.markRestored(
        deletion.id
      );
    });
  }
}

export const restoreCollectionWorkflow =
  new RestoreCollectionWorkflow();