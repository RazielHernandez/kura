import { BaseRepository } from "./BaseRepository";
import { Collection } from "../models/collection";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super("collections");
  }

  async create(
    name: string,
    options?: {
      icon?: string | null;
      color?: string | null;
      description?: string | null;
      sortOrder?: number;
    }
  ): Promise<Collection> {
    const id = generateId();
    const timestamp = now();

    const collection: Collection = {
      id,
      name,
      icon: options?.icon ?? null,
      color: options?.color ?? null,
      description: options?.description ?? null,
      sortOrder: options?.sortOrder ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO collections (
        id,
        name,
        icon,
        color,
        description,
        sortOrder,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        collection.id,
        collection.name,
        collection.icon,
        collection.color,
        collection.description,
        collection.sortOrder,
        collection.createdAt,
        collection.updatedAt,
        collection.deletedAt,
      ]
    );

    return collection;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      icon?: string | null;
      color?: string | null;
      description?: string | null;
      sortOrder?: number;
    }
  ): Promise<Collection | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedCollection: Collection = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE collections
      SET
        name = ?,
        icon = ?,
        color = ?,
        description = ?,
        sortOrder = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedCollection.name,
        updatedCollection.icon,
        updatedCollection.color,
        updatedCollection.description,
        updatedCollection.sortOrder,
        updatedCollection.updatedAt,
        id,
      ]
    );

    return updatedCollection;
  }

  async search(query: string): Promise<Collection[]> {
    return this.query<Collection>(
      `
      SELECT *
      FROM collections
      WHERE deletedAt IS NULL
        AND (
          name LIKE ?
          OR description LIKE ?
        )
      ORDER BY sortOrder ASC, name ASC
      `,
      [`%${query}%`, `%${query}%`]
    );
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await this.queryFirst<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM collections
      WHERE name = ?
        AND deletedAt IS NULL
      `,
      [name]
    );

    return (result?.count ?? 0) > 0;
  }

  async getAllOrdered(): Promise<Collection[]> {
    return this.query<Collection>(
      `
      SELECT *
      FROM collections
      WHERE deletedAt IS NULL
      ORDER BY sortOrder ASC, name ASC
      `
    );
  }
}

export const collectionRepository = new CollectionRepository();