import { BaseRepository } from "./BaseRepository";
import {
  CollectionField,
  FieldType,
} from "../models/CollectionField";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class CollectionFieldRepository
  extends BaseRepository<CollectionField> {

  constructor() {
    super(
      "collection_fields",
      CollectionFieldRepository.mapRow
    );
  }

  private static mapRow(
    row: CollectionField
  ): CollectionField {
    return {
      ...row,
      required: Boolean(row.required),
    };
  }

  async create(
    collectionId: string,
    name: string,
    fieldType: FieldType,
    options?: {
      required?: boolean;
      sortOrder?: number;
    }
  ): Promise<CollectionField> {
    const id = generateId();
    const timestamp = now();

    const sortOrder =
      options?.sortOrder ??
      await this.getNextSortOrder(collectionId);

    const field: CollectionField = {
      id,
      collectionId,
      name,
      fieldType,
      required: options?.required ?? false,
      sortOrder,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO collection_fields (
        id,
        collectionId,
        name,
        fieldType,
        required,
        sortOrder,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        field.id,
        field.collectionId,
        field.name,
        field.fieldType,
        field.required ? 1 : 0,
        field.sortOrder,
        field.createdAt,
        field.updatedAt,
        field.deletedAt,
      ]
    );

    return field;
  }

  async update(
    id: string,
    updates: {
      name?: string;
      fieldType?: FieldType;
      required?: boolean;
      sortOrder?: number;
    }
  ): Promise<CollectionField | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedField: CollectionField = {
      ...existing,
      ...updates,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE collection_fields
      SET
        name = ?,
        fieldType = ?,
        required = ?,
        sortOrder = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedField.name,
        updatedField.fieldType,
        updatedField.required ? 1 : 0,
        updatedField.sortOrder,
        updatedField.updatedAt,
        id,
      ]
    );

    return updatedField;
  }

  async getByCollectionId(
    collectionId: string
  ): Promise<CollectionField[]> {
    return this.query(
      `
      SELECT *
      FROM collection_fields
      WHERE collectionId = ?
        AND deletedAt IS NULL
      ORDER BY sortOrder ASC
      `,
      [collectionId]
    );
  }

  async search(
    collectionId: string,
    query: string
  ): Promise<CollectionField[]> {
    return this.query(
      `
      SELECT *
      FROM collection_fields
      WHERE collectionId = ?
        AND deletedAt IS NULL
        AND name LIKE ?
      ORDER BY sortOrder ASC, name ASC
      `,
      [collectionId, `%${query}%`]
    );
  }

  async existsByName(
    collectionId: string,
    name: string
  ): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM collection_fields
      WHERE collectionId = ?
        AND name = ?
        AND deletedAt IS NULL
      `,
      [collectionId, name]
    );

    return (result?.count ?? 0) > 0;
  }

  async getNextSortOrder(
    collectionId: string
  ): Promise<number> {
    const result = await this.queryFirstRaw<{
      maxSortOrder: number | null;
    }>(
      `
      SELECT MAX(sortOrder) as maxSortOrder
      FROM collection_fields
      WHERE collectionId = ?
        AND deletedAt IS NULL
      `,
      [collectionId]
    );

    return (result?.maxSortOrder ?? -1) + 1;
  }

  async reorder(
    id: string,
    sortOrder: number
  ): Promise<CollectionField | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedAt = now();

    await this.execute(
      `
      UPDATE collection_fields
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
}

export const collectionFieldRepository =
  new CollectionFieldRepository();