import { BaseRepository } from "./BaseRepository";
import { CustomList } from "../models/CustomList";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class CustomListRepository extends BaseRepository<CustomList> {
  constructor() {
    super("custom_lists");
  }

  async create(
    name: string,
    options?: {
      icon?: string | null;
      color?: string | null;
    }
  ): Promise<CustomList> {
    const id = generateId();
    const timestamp = now();

    const customList: CustomList = {
      id,
      name,
      icon: options?.icon ?? null,
      color: options?.color ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO custom_lists (
        id,
        name,
        icon,
        color,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customList.id,
        customList.name,
        customList.icon,
        customList.color,
        customList.createdAt,
        customList.updatedAt,
        customList.deletedAt,
      ]
    );

    return customList;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      icon?: string | null;
      color?: string | null;
    }
  ): Promise<CustomList | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedList: CustomList = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE custom_lists
      SET
        name = ?,
        icon = ?,
        color = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedList.name,
        updatedList.icon,
        updatedList.color,
        updatedList.updatedAt,
        id,
      ]
    );

    return updatedList;
  }

  async search(
    query: string
  ): Promise<CustomList[]> {
    return this.query(
      `
      SELECT *
      FROM custom_lists
      WHERE deletedAt IS NULL
        AND name LIKE ?
      ORDER BY name ASC
      `,
      [`%${query}%`]
    );
  }

  async existsByName(
    name: string
  ): Promise<boolean> {
    const result =
      await this.queryFirstRaw<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM custom_lists
        WHERE name = ?
          AND deletedAt IS NULL
        `,
        [name]
      );

    return (result?.count ?? 0) > 0;
  }

  async getByName(
    name: string
  ): Promise<CustomList | null> {
    return this.queryFirst(
      `
      SELECT *
      FROM custom_lists
      WHERE name = ?
        AND deletedAt IS NULL
      LIMIT 1
      `,
      [name]
    );
  }
}

export const customListRepository =
  new CustomListRepository();