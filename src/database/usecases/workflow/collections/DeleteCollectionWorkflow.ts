import { databaseService } from "../../../DatabaseService";
import { collectionRepository } from "../../../repositories/CollectionRepository";
import { collectionDeletionRepository } from "../../../repositories/CollectionDeletionRepository";

interface IdRow {
  id: string;
}

async function getIds(
  sql: string,
  params: (string | number | null)[] = []
): Promise<string[]> {
  const rows = await databaseService.query<IdRow>(
    sql,
    params
  );

  return rows.map(row => row.id);
}

async function softDeleteIds(
  table: string,
  ids: string[],
  timestamp: string
): Promise<void> {
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(", ");

  await databaseService.execute(
    `
    UPDATE ${table}
    SET deletedAt = ?, updatedAt = ?
    WHERE id IN (${placeholders})
      AND deletedAt IS NULL
    `,
    [timestamp, timestamp, ...ids]
  );
}

export class DeleteCollectionWorkflow {
  async execute(collectionId: string): Promise<void> {
    const collection =
      await collectionRepository.getById(collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    await databaseService.transaction(async () => {
      // Recheck inside the transaction to avoid creating
      // a deletion snapshot for an already-deleted collection.
      const currentCollection =
        await collectionRepository.getById(collectionId);

      if (!currentCollection) {
        throw new Error("Collection not found");
      }

      const timestamp = new Date().toISOString();

      const collectionFieldIds = await getIds(
        `
        SELECT id
        FROM collection_fields
        WHERE collectionId = ?
          AND deletedAt IS NULL
        `,
        [collectionId]
      );

      const itemIds = await getIds(
        `
        SELECT id
        FROM items
        WHERE collectionId = ?
          AND deletedAt IS NULL
        `,
        [collectionId]
      );

      const tagIds = await getIds(
        `
        SELECT id
        FROM tags
        WHERE collectionId = ?
          AND deletedAt IS NULL
        `,
        [collectionId]
      );

      // Capture active values belonging to the affected items
      // or fields. This also handles values belonging to an
      // already-deleted item whose field is being deleted now.
      const valueConditions: string[] = [];
      const valueParams: string[] = [];

      if (itemIds.length > 0) {
        valueConditions.push(
          `itemId IN (${itemIds.map(() => "?").join(", ")})`
        );
        valueParams.push(...itemIds);
      }

      if (collectionFieldIds.length > 0) {
        valueConditions.push(
          `fieldId IN (${collectionFieldIds.map(() => "?").join(", ")})`
        );
        valueParams.push(...collectionFieldIds);
      }

      const itemValueIds =
        valueConditions.length > 0
          ? await getIds(
              `
              SELECT id
              FROM item_values
              WHERE deletedAt IS NULL
                AND (${valueConditions.join(" OR ")})
              `,
              valueParams
            )
          : [];

      const itemImageIds =
        itemIds.length > 0
          ? await getIds(
              `
              SELECT id
              FROM item_images
              WHERE deletedAt IS NULL
                AND itemId IN (${itemIds.map(() => "?").join(", ")})
              `,
              itemIds
            )
          : [];

      const itemNoteIds =
        itemIds.length > 0
          ? await getIds(
              `
              SELECT id
              FROM item_notes
              WHERE deletedAt IS NULL
                AND itemId IN (${itemIds.map(() => "?").join(", ")})
              `,
              itemIds
            )
          : [];

      // Save the exact records this operation will delete.
      await collectionDeletionRepository.create({
        collectionId,
        collectionFieldIds,
        itemIds,
        itemValueIds,
        itemImageIds,
        itemNoteIds,
        tagIds,
      });

      await softDeleteIds(
        "item_values",
        itemValueIds,
        timestamp
      );

      await softDeleteIds(
        "item_images",
        itemImageIds,
        timestamp
      );

      await softDeleteIds(
        "item_notes",
        itemNoteIds,
        timestamp
      );

      await softDeleteIds(
        "items",
        itemIds,
        timestamp
      );

      await softDeleteIds(
        "collection_fields",
        collectionFieldIds,
        timestamp
      );

      await softDeleteIds(
        "tags",
        tagIds,
        timestamp
      );

      await databaseService.execute(
        `
        UPDATE collections
        SET deletedAt = ?, updatedAt = ?
        WHERE id = ?
          AND deletedAt IS NULL
        `,
        [timestamp, timestamp, collectionId]
      );
    });
  }
}

export const deleteCollectionWorkflow =
  new DeleteCollectionWorkflow();