import { databaseService } from "../DatabaseService";
import { ItemHistory, ItemHistoryType } from "../models/ItemHistory";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class ItemHistoryRepository {
  async create(
    itemId: string,
    type: ItemHistoryType,
    description: string | null = null
  ): Promise<ItemHistory> {
    const history: ItemHistory = {
      id: generateId(),
      itemId,
      type,
      description,
      createdAt: now(),
    };

    await databaseService.execute(
      `
      INSERT INTO item_history (
        id,
        itemId,
        type,
        description,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        history.id,
        history.itemId,
        history.type,
        history.description,
        history.createdAt,
      ]
    );

    return history;
  }

  async getByItemId(
    itemId: string
  ): Promise<ItemHistory[]> {
    return databaseService.query<ItemHistory>(
      `
      SELECT *
      FROM item_history
      WHERE itemId = ?
      ORDER BY createdAt DESC
      `,
      [itemId]
    );
  }

  async getByType(
    itemId: string,
    type: ItemHistoryType
  ): Promise<ItemHistory[]> {
    return databaseService.query<ItemHistory>(
      `
      SELECT *
      FROM item_history
      WHERE itemId = ?
        AND type = ?
      ORDER BY createdAt DESC
      `,
      [itemId, type]
    );
  }

  async getLatest(
    itemId: string
  ): Promise<ItemHistory | null> {
    return databaseService.queryFirst<ItemHistory>(
      `
      SELECT *
      FROM item_history
      WHERE itemId = ?
      ORDER BY createdAt DESC
      LIMIT 1
      `,
      [itemId]
    );
  }

  async countByItemId(
    itemId: string
  ): Promise<number> {
    const result =
      await databaseService.queryFirst<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM item_history
        WHERE itemId = ?
        `,
        [itemId]
      );

    return result?.count ?? 0;
  }
}

export const itemHistoryRepository =
  new ItemHistoryRepository();