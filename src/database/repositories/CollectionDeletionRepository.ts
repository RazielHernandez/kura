
import { databaseService } from "../DatabaseService";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export interface CollectionDeletion {
  id: string;
  collectionId: string;
  deletedAt: string;
  restoredAt: string | null;
  collectionFieldIds: string[];
  itemIds: string[];
  itemValueIds: string[];
  itemImageIds: string[];
  itemNoteIds: string[];
  tagIds: string[];
}

interface CollectionDeletionRow {
  id: string;
  collectionId: string;
  deletedAt: string;
  restoredAt: string | null;
  collectionFieldIds: string;
  itemIds: string;
  itemValueIds: string;
  itemImageIds: string;
  itemNoteIds: string;
  tagIds: string;
}

export class CollectionDeletionRepository {
  async create(input: {
    collectionId: string;
    collectionFieldIds: string[];
    itemIds: string[];
    itemValueIds: string[];
    itemImageIds: string[];
    itemNoteIds: string[];
    tagIds: string[];
  }): Promise<CollectionDeletion> {
    const deletion: CollectionDeletion = {
      id: generateId(),
      collectionId: input.collectionId,
      deletedAt: now(),
      restoredAt: null,
      collectionFieldIds: input.collectionFieldIds,
      itemIds: input.itemIds,
      itemValueIds: input.itemValueIds,
      itemImageIds: input.itemImageIds,
      itemNoteIds: input.itemNoteIds,
      tagIds: input.tagIds,
    };

    await databaseService.execute(
      `
      INSERT INTO collection_deletions (
        id,
        collectionId,
        deletedAt,
        restoredAt,
        collectionFieldIds,
        itemIds,
        itemValueIds,
        itemImageIds,
        itemNoteIds,
        tagIds
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        deletion.id,
        deletion.collectionId,
        deletion.deletedAt,
        deletion.restoredAt,
        JSON.stringify(deletion.collectionFieldIds),
        JSON.stringify(deletion.itemIds),
        JSON.stringify(deletion.itemValueIds),
        JSON.stringify(deletion.itemImageIds),
        JSON.stringify(deletion.itemNoteIds),
        JSON.stringify(deletion.tagIds),
      ]
    );

    return deletion;
  }

  async getActiveByCollectionId(
    collectionId: string
  ): Promise<CollectionDeletion | null> {
    const row =
      await databaseService.queryFirst<CollectionDeletionRow>(
        `
        SELECT *
        FROM collection_deletions
        WHERE collectionId = ?
          AND restoredAt IS NULL
        ORDER BY deletedAt DESC
        LIMIT 1
        `,
        [collectionId]
      );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      collectionId: row.collectionId,
      deletedAt: row.deletedAt,
      restoredAt: row.restoredAt,
      collectionFieldIds: JSON.parse(row.collectionFieldIds),
      itemIds: JSON.parse(row.itemIds),
      itemValueIds: JSON.parse(row.itemValueIds),
      itemImageIds: JSON.parse(row.itemImageIds),
      itemNoteIds: JSON.parse(row.itemNoteIds),
      tagIds: JSON.parse(row.tagIds),
    };
  }

  async markRestored(id: string): Promise<void> {
    await databaseService.execute(
      `
      UPDATE collection_deletions
      SET restoredAt = ?
      WHERE id = ?
        AND restoredAt IS NULL
      `,
      [now(), id]
    );
  }
}

export const collectionDeletionRepository =
  new CollectionDeletionRepository();