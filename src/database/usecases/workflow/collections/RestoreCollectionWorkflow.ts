import { databaseService } from "../../../DatabaseService";
import { collectionRepository } from "../../../repositories/CollectionRepository";
import { collectionDeletionRepository } from "../../../repositories/CollectionDeletionRepository";

async function restoreIds(
  table: string,
  ids: string[],
  timestamp: string,
  deletionTimestamp: string
): Promise<void> {
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(", ");

  await databaseService.execute(
    `
    UPDATE ${table}
    SET deletedAt = NULL, updatedAt = ?
    WHERE id IN (${placeholders})
      AND deletedAt = ?
    `,
    [timestamp, ...ids, deletionTimestamp]
  );
}

export class RestoreCollectionWorkflow {
  async execute(collectionId: string): Promise<void> {
    await databaseService.transaction(async () => {
      // Recheck the collection inside the transaction.
      const currentCollection =
        await collectionRepository.getByIdIncludingDeleted(
          collectionId
        );

      if (!currentCollection) {
        throw new Error("Collection not found");
      }

      if (!currentCollection.deletedAt) {
        throw new Error("Collection is not deleted");
      }

      // Retrieve the deletion snapshot.
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
      const collectionResult = await databaseService.execute(
        `
        UPDATE collections
        SET deletedAt = NULL, updatedAt = ?
        WHERE id = ?
          AND deletedAt = ?
        `,
        [timestamp, collectionId, deletion.deletedAt]
      );

      if (collectionResult.changes !== 1) {
        throw new Error(
          "Collection could not be restored because its deletion state changed"
        );
      }

      await restoreIds(
        "collection_fields",
        deletion.collectionFieldIds,
        timestamp,
        deletion.deletedAt
      );

      await restoreIds(
        "items",
        deletion.itemIds,
        timestamp,
        deletion.deletedAt
      );

      await restoreIds(
        "item_values",
        deletion.itemValueIds,
        timestamp,
        deletion.deletedAt
      );

      await restoreIds(
        "item_images",
        deletion.itemImageIds,
        timestamp,
        deletion.deletedAt
      );

      await restoreIds(
        "item_notes",
        deletion.itemNoteIds,
        timestamp,
        deletion.deletedAt
      );

      await restoreIds(
        "tags",
        deletion.tagIds,
        timestamp,
        deletion.deletedAt
      );

      await collectionDeletionRepository.markRestored(
        deletion.id
      );
    });
  }
}

export const restoreCollectionWorkflow =
  new RestoreCollectionWorkflow();