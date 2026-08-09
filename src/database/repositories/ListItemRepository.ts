import { databaseService } from "../DatabaseService";
import { Item } from "../models/Item";

export class ListItemRepository {
  async add(
    listId: string,
    itemId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      INSERT OR IGNORE INTO list_items (
        listId,
        itemId
      )
      VALUES (?, ?)
      `,
      [listId, itemId]
    );
  }

  async remove(
    listId: string,
    itemId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM list_items
      WHERE listId = ?
        AND itemId = ?
      `,
      [listId, itemId]
    );
  }

  async exists(
    listId: string,
    itemId: string
  ): Promise<boolean> {
    const result =
      await databaseService.queryFirst<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM list_items
        WHERE listId = ?
          AND itemId = ?
        `,
        [listId, itemId]
      );

    return (result?.count ?? 0) > 0;
  }

  async getItemIdsByListId(
    listId: string
  ): Promise<string[]> {
    const rows = await databaseService.query<{
      itemId: string;
    }>(
      `
      SELECT itemId
      FROM list_items
      WHERE listId = ?
      `,
      [listId]
    );

    return rows.map((row) => row.itemId);
  }

  async getListIdsByItemId(
    itemId: string
  ): Promise<string[]> {
    const rows = await databaseService.query<{
      listId: string;
    }>(
      `
      SELECT listId
      FROM list_items
      WHERE itemId = ?
      `,
      [itemId]
    );

    return rows.map((row) => row.listId);
  }

  async getItemsByListId(
    listId: string
  ): Promise<Item[]> {
    return databaseService.query<Item>(
      `
      SELECT i.*
      FROM items i
      INNER JOIN list_items li
        ON li.itemId = i.id
      WHERE li.listId = ?
        AND i.deletedAt IS NULL
      ORDER BY i.updatedAt DESC
      `,
      [listId]
    );
  }

  async setItemsForList(
    listId: string,
    itemIds: string[]
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM list_items
      WHERE listId = ?
      `,
      [listId]
    );

    for (const itemId of itemIds) {
      await this.add(listId, itemId);
    }
  }

  async removeAllForList(
    listId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM list_items
      WHERE listId = ?
      `,
      [listId]
    );
  }

  async removeAllForItem(
    itemId: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM list_items
      WHERE itemId = ?
      `,
      [itemId]
    );
  }

  async countByListId(
    listId: string
  ): Promise<number> {
    const result =
        await databaseService.queryFirst<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM list_items li
        INNER JOIN items i
            ON i.id = li.itemId
        WHERE li.listId = ?
            AND i.deletedAt IS NULL
        `,
        [listId]
        );

    return result?.count ?? 0;
 }
}

export const listItemRepository =
  new ListItemRepository();