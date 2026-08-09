import { BaseRepository } from "./BaseRepository";
import { Tag } from "../models/Tag";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super("tags");
  }

  async create(
    collectionId: string,
    name: string,
    options?: {
      color?: string | null;
    }
  ): Promise<Tag> {
    const id = generateId();
    const timestamp = now();

    const tag: Tag = {
      id,
      collectionId,
      name,
      color: options?.color ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO tags (
        id,
        collectionId,
        name,
        color,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tag.id,
        tag.collectionId,
        tag.name,
        tag.color ?? null,
        tag.createdAt,
        tag.updatedAt,
        tag.deletedAt,
      ]
    );

    return tag;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      color?: string | null;
    }
  ): Promise<Tag | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedTag: Tag = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE tags
      SET
        name = ?,
        color = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedTag.name,
        updatedTag.color ?? null,
        updatedTag.updatedAt,
        id,
      ]
    );

    return updatedTag;
  }

  async getByCollectionId(
    collectionId: string
  ): Promise<Tag[]> {
    return this.query(
      `
      SELECT *
      FROM tags
      WHERE collectionId = ?
        AND deletedAt IS NULL
      ORDER BY name ASC
      `,
      [collectionId]
    );
  }

  async search(
    collectionId: string,
    query: string
  ): Promise<Tag[]> {
    return this.query(
      `
      SELECT *
      FROM tags
      WHERE collectionId = ?
        AND deletedAt IS NULL
        AND name LIKE ?
      ORDER BY name ASC
      `,
      [
        collectionId,
        `%${query}%`,
      ]
    );
  }

  async getByName(
    collectionId: string,
    name: string
  ): Promise<Tag | null> {
    return this.queryFirst(
      `
      SELECT *
      FROM tags
      WHERE collectionId = ?
        AND name = ?
        AND deletedAt IS NULL
      LIMIT 1
      `,
      [collectionId, name]
    );
  }

  async existsByName(
    collectionId: string,
    name: string
  ): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM tags
      WHERE collectionId = ?
        AND name = ?
        AND deletedAt IS NULL
      `,
      [collectionId, name]
    );

    return (result?.count ?? 0) > 0;
  }
}

export const tagRepository = new TagRepository();