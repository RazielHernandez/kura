import { databaseService } from "../DatabaseService";
import { Tag } from "../models/Tag";

export class ItemTagRepository {
  protected readonly db = databaseService.connection;

  async add(
    itemId: string,
    tagId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      INSERT OR IGNORE INTO item_tags (
        itemId,
        tagId
      )
      VALUES (?, ?)
      `,
      [itemId, tagId]
    );
  }

  async remove(
    itemId: string,
    tagId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM item_tags
      WHERE itemId = ?
        AND tagId = ?
      `,
      [itemId, tagId]
    );
  }

  async exists(
    itemId: string,
    tagId: string
  ): Promise<boolean> {
    const result =
      await databaseService.queryFirst<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM item_tags
        WHERE itemId = ?
          AND tagId = ?
        `,
        [itemId, tagId]
      );

    return (result?.count ?? 0) > 0;
  }

  async getTagIdsByItemId(
    itemId: string
  ): Promise<string[]> {
    const rows = await databaseService.query<{
      tagId: string;
    }>(
      `
      SELECT tagId
      FROM item_tags
      WHERE itemId = ?
      `,
      [itemId]
    );

    return rows.map((row) => row.tagId);
  }

  async getItemIdsByTagId(
    tagId: string
  ): Promise<string[]> {
    const rows = await databaseService.query<{
      itemId: string;
    }>(
      `
      SELECT itemId
      FROM item_tags
      WHERE tagId = ?
      `,
      [tagId]
    );

    return rows.map((row) => row.itemId);
  }

  async getTagsByItemId(
    itemId: string
  ): Promise<Tag[]> {
    return databaseService.query<Tag>(
      `
      SELECT t.*
      FROM tags t
      INNER JOIN item_tags it
        ON it.tagId = t.id
      WHERE it.itemId = ?
        AND t.deletedAt IS NULL
      ORDER BY t.name ASC
      `,
      [itemId]
    );
  }

  async getItemsByTagId(
    tagId: string
  ): Promise<string[]> {
    const rows = await databaseService.query<{
      itemId: string;
    }>(
      `
      SELECT it.itemId
      FROM item_tags it
      INNER JOIN items i
        ON i.id = it.itemId
      WHERE it.tagId = ?
        AND i.deletedAt IS NULL
      ORDER BY i.name ASC
      `,
      [tagId]
    );

    return rows.map((row) => row.itemId);
  }

  async setTagsForItem(
    itemId: string,
    tagIds: string[]
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM item_tags
      WHERE itemId = ?
      `,
      [itemId]
    );

    for (const tagId of tagIds) {
      await this.add(itemId, tagId);
    }
  }

  async removeAllForItem(
    itemId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM item_tags
      WHERE itemId = ?
      `,
      [itemId]
    );
  }

  async removeAllForTag(
    tagId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM item_tags
      WHERE tagId = ?
      `,
      [tagId]
    );
  }
}

export const itemTagRepository =
  new ItemTagRepository();