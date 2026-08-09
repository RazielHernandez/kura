import { BaseRepository } from "./BaseRepository";
import { ItemImage } from "../models/ItemImage";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class ItemImageRepository extends BaseRepository<ItemImage> {
  constructor() {
    super("item_images");
  }

  async create(
    itemId: string,
    uri: string,
    options?: {
      thumbnailUri?: string | null;
      sortOrder?: number;
    }
  ): Promise<ItemImage> {
    const id = generateId();
    const timestamp = now();

    const sortOrder =
      options?.sortOrder ??
      await this.getNextSortOrder(itemId);

    const image: ItemImage = {
      id,
      itemId,
      uri,
      thumbnailUri: options?.thumbnailUri ?? null,
      sortOrder,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO item_images (
        id,
        itemId,
        uri,
        thumbnailUri,
        sortOrder,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        image.id,
        image.itemId,
        image.uri,
        image.thumbnailUri,
        image.sortOrder,
        image.createdAt,
        image.updatedAt,
        image.deletedAt,
      ]
    );

    return image;
  }

  async update(
    id: string,
    updates: {
      uri?: string;
      thumbnailUri?: string | null;
      sortOrder?: number;
    }
  ): Promise<ItemImage | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedImage: ItemImage = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE item_images
      SET
        uri = ?,
        thumbnailUri = ?,
        sortOrder = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedImage.uri,
        updatedImage.thumbnailUri ?? null,
        updatedImage.sortOrder,
        updatedImage.updatedAt,
        id,
      ]
    );

    return updatedImage;
  }

  async getByItemId(
    itemId: string
  ): Promise<ItemImage[]> {
    return this.query(
      `
      SELECT *
      FROM item_images
      WHERE itemId = ?
        AND deletedAt IS NULL
      ORDER BY sortOrder ASC
      `,
      [itemId]
    );
  }

  async getNextSortOrder(
    itemId: string
  ): Promise<number> {
    const result = await this.queryFirstRaw<{
      maxSortOrder: number | null;
    }>(
      `
      SELECT MAX(sortOrder) as maxSortOrder
      FROM item_images
      WHERE itemId = ?
        AND deletedAt IS NULL
      `,
      [itemId]
    );

    return (result?.maxSortOrder ?? -1) + 1;
  }

  async reorder(
    id: string,
    sortOrder: number
  ): Promise<ItemImage | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedAt = now();

    await this.execute(
      `
      UPDATE item_images
      SET
        sortOrder = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [sortOrder, updatedAt, id]
    );

    return {
      ...existing,
      sortOrder,
      updatedAt,
    };
  }

  async deleteByItemId(
    itemId: string
  ): Promise<void> {
    const timestamp = now();

    await this.execute(
      `
      UPDATE item_images
      SET
        deletedAt = ?,
        updatedAt = ?
      WHERE itemId = ?
        AND deletedAt IS NULL
      `,
      [timestamp, timestamp, itemId]
    );
  }
}

export const itemImageRepository =
  new ItemImageRepository();