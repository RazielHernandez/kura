import { BaseRepository } from "./BaseRepository";
import { Item } from "../models/Item";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class ItemRepository extends BaseRepository<Item> {
  constructor() {
    super(
      "items",
      ItemRepository.mapRow
    );
  }

  private static mapRow(row: Item): Item {
    return {
      ...row,
      favorite: Boolean(row.favorite),
    };
  }

  async create(
    collectionId: string,
    name: string,
    options?: {
      description?: string;
      favorite?: boolean;
    }
  ): Promise<Item> {
    const id = generateId();
    const timestamp = now();

    const item: Item = {
      id,
      collectionId,
      name,
      description: options?.description ?? null,
      favorite: options?.favorite ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO items (
        id,
        collectionId,
        name,
        description,
        favorite,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        item.id,
        item.collectionId,
        item.name,
        item.description ?? null,
        item.favorite ? 1 : 0,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
      ]
    );

    return item;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      description?: string;
      favorite?: boolean;
    }
  ): Promise<Item | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedItem: Item = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE items
      SET
        name = ?,
        description = ?,
        favorite = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedItem.name,
        updatedItem.description ?? null,
        updatedItem.favorite ? 1 : 0,
        updatedItem.updatedAt,
        id,
      ]
    );

    return updatedItem;
  }

  async getByCollectionId(
    collectionId: string
  ): Promise<Item[]> {
    return this.query(
      `
      SELECT *
      FROM items
      WHERE collectionId = ?
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      `,
      [collectionId]
    );
  }

  async getFavoritesByCollectionId(
    collectionId: string
  ): Promise<Item[]> {
    return this.query(
      `
      SELECT *
      FROM items
      WHERE collectionId = ?
        AND favorite = 1
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      `,
      [collectionId]
    );
  }

  async search(
    collectionId: string,
    query: string
  ): Promise<Item[]> {
    return this.query(
      `
      SELECT *
      FROM items
      WHERE collectionId = ?
        AND deletedAt IS NULL
        AND (
          name LIKE ?
          OR description LIKE ?
        )
      ORDER BY updatedAt DESC
      `,
      [
        collectionId,
        `%${query}%`,
        `%${query}%`,
      ]
    );
  }

  async existsByName(
    collectionId: string,
    name: string
  ): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM items
      WHERE collectionId = ?
        AND name = ?
        AND deletedAt IS NULL
      `,
      [collectionId, name]
    );

    return (result?.count ?? 0) > 0;
  }

  async setFavorite(
    id: string,
    favorite: boolean
  ): Promise<Item | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedAt = now();

    await this.execute(
      `
      UPDATE items
      SET
        favorite = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        favorite ? 1 : 0,
        updatedAt,
        id,
      ]
    );

    return {
      ...existing,
      favorite,
      updatedAt,
    };
  }
}

export const itemRepository = new ItemRepository();