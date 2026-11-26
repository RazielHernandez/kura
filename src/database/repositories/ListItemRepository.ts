import { databaseService } from "../DatabaseService";
import { Item, ItemWithCollection} from "../models/Item";

export class ListItemRepository {
  
  async add(
    listId: string,
    itemId: string
  ): Promise<void> {
    const list = await databaseService.queryFirst<{ id: string }>(
      `
      SELECT id
      FROM custom_lists
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [listId]
    );

    if (!list) {
      throw new Error(`Custom list not found: ${listId}`);
    }

    const item = await databaseService.queryFirst<{ id: string }>(
      `
      SELECT id
      FROM items
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [itemId]
    );

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

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

  // async getItemsByListId(
  //   listId: string
  // ): Promise<Item[]> {
  //   return databaseService.query<Item>(
  //     `
  //     SELECT i.*
  //     FROM items i
  //     INNER JOIN list_items li
  //       ON li.itemId = i.id
  //     WHERE li.listId = ?
  //       AND i.deletedAt IS NULL
  //     ORDER BY i.updatedAt DESC
  //     `,
  //     [listId]
  //   );
  // }

  
  async getItemsByListId(
    listId: string
  ): Promise<ItemWithCollection[]> {
    const rows = await databaseService.query<
      Omit<ItemWithCollection, "favorite"> & {
        favorite: number;
      }
    >(
      `
      SELECT
        i.*,
        c.name AS collectionName,
        c.icon AS collectionIcon,
        c.color AS collectionColor
      FROM items i
      INNER JOIN list_items li
        ON li.itemId = i.id
      INNER JOIN collections c
        ON c.id = i.collectionId
      INNER JOIN custom_lists cl
        ON cl.id = li.listId
      WHERE li.listId = ?
        AND i.deletedAt IS NULL
        AND c.deletedAt IS NULL
        AND cl.deletedAt IS NULL
      ORDER BY i.updatedAt DESC
      `,
      [listId]
    );

    return rows.map((row) => ({
      ...row,
      favorite: Boolean(row.favorite),
    }));
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
        INNER JOIN collections c
          ON c.id = i.collectionId
        INNER JOIN custom_lists cl
          ON cl.id = li.listId
        WHERE li.listId = ?
          AND i.deletedAt IS NULL
          AND c.deletedAt IS NULL
          AND cl.deletedAt IS NULL
        `,
        [listId]
      );

    return result?.count ?? 0;
  }
}

export const listItemRepository =
  new ListItemRepository();