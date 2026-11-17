import { BaseRepository } from "./BaseRepository";
import { ItemValue } from "../models/ItemValue";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";
import { HistoricalItemField } from "../models/HistoricalItemField";
import { FieldType } from "../models/CollectionField";

export class ItemValueRepository extends BaseRepository<ItemValue> {
  constructor() {
    super("item_values");
  }

  async create(
    itemId: string,
    fieldId: string,
    value: string | null = null
  ): Promise<ItemValue> {
    const id = generateId();
    const timestamp = now();

    const itemValue: ItemValue = {
      id,
      itemId,
      fieldId,
      value,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO item_values (
        id,
        itemId,
        fieldId,
        value,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        itemValue.id,
        itemValue.itemId,
        itemValue.fieldId,
        itemValue.value,
        itemValue.createdAt,
        itemValue.updatedAt,
        itemValue.deletedAt,
      ]
    );

    return itemValue;
  }

  async update(
    id: string,
    value: string | null
  ): Promise<ItemValue | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedItemValue: ItemValue = {
      ...existing,
      value,
      updatedAt: now(),
    };

    const result = await this.execute(
      `
      UPDATE item_values
      SET
        value = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedItemValue.value,
        updatedItemValue.updatedAt,
        id,
      ]
    );

    if (result.changes !== 1) {
      return null;
    }

    return updatedItemValue;
  }

  async getByItemAndFieldIncludingDeleted(
    itemId: string,
    fieldId: string
  ): Promise<ItemValue | null> {
    return this.queryFirst(
      `
      SELECT *
      FROM item_values
      WHERE itemId = ?
        AND fieldId = ?
      LIMIT 1
      `,
      [itemId, fieldId]
    );
  }

  async getByItemId(
    itemId: string
  ): Promise<ItemValue[]> {
    return this.query(
      `
      SELECT *
      FROM item_values
      WHERE itemId = ?
        AND deletedAt IS NULL
      ORDER BY createdAt ASC
      `,
      [itemId]
    );
  }

  async getByFieldId(
    fieldId: string
  ): Promise<ItemValue[]> {
    return this.query(
      `
      SELECT *
      FROM item_values
      WHERE fieldId = ?
        AND deletedAt IS NULL
      ORDER BY createdAt ASC
      `,
      [fieldId]
    );
  }

  async getNonEmptyByFieldIdForActiveItems(
    fieldId: string
  ): Promise<ItemValue[]> {
    return this.query(
      `
      SELECT item_values.*
      FROM item_values
      INNER JOIN items
        ON items.id = item_values.itemId
      WHERE item_values.fieldId = ?
        AND item_values.deletedAt IS NULL
        AND items.deletedAt IS NULL
        AND item_values.value IS NOT NULL
        AND TRIM(item_values.value) != ''
      ORDER BY item_values.createdAt ASC
      `,
      [fieldId]
    );
  }
  
  async getHistoricalFieldsByItemId(
    itemId: string
  ): Promise<HistoricalItemField[]> {
    type HistoricalFieldRow = {
      field_id: string;
      field_collectionId: string;
      field_name: string;
      field_fieldType: FieldType;
      field_required: number;
      field_sortOrder: number;
      field_createdAt: string;
      field_updatedAt: string;
      field_deletedAt: string | null;
      item_value: string | null;
    };

    const rows = await this.queryRaw<HistoricalFieldRow>(
      `
      SELECT
        cf.id AS field_id,
        cf.collectionId AS field_collectionId,
        cf.name AS field_name,
        cf.fieldType AS field_fieldType,
        cf.required AS field_required,
        cf.sortOrder AS field_sortOrder,
        cf.createdAt AS field_createdAt,
        cf.updatedAt AS field_updatedAt,
        cf.deletedAt AS field_deletedAt,
        iv.value AS item_value
      FROM item_values iv
      INNER JOIN collection_fields cf
        ON cf.id = iv.fieldId
      INNER JOIN items i
        ON i.id = iv.itemId
      WHERE iv.itemId = ?
        AND iv.deletedAt IS NULL
        AND cf.deletedAt IS NOT NULL
        AND i.deletedAt IS NULL
      ORDER BY cf.sortOrder ASC
      `,
      [itemId]
    );

    return rows.map(row => ({
      field: {
        id: row.field_id,
        collectionId: row.field_collectionId,
        name: row.field_name,
        fieldType: row.field_fieldType,
        required: Boolean(row.field_required),
        sortOrder: row.field_sortOrder,
        createdAt: row.field_createdAt,
        updatedAt: row.field_updatedAt,
        deletedAt: row.field_deletedAt,
      },
      value: row.item_value,
    }));
  }

  async getByItemAndField(
    itemId: string,
    fieldId: string
  ): Promise<ItemValue | null> {
    return this.queryFirst(
      `
      SELECT *
      FROM item_values
      WHERE itemId = ?
        AND fieldId = ?
        AND deletedAt IS NULL
      LIMIT 1
      `,
      [itemId, fieldId]
    );
  }

  async existsByItemAndField(
    itemId: string,
    fieldId: string
  ): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM item_values
      WHERE itemId = ?
        AND fieldId = ?
        AND deletedAt IS NULL
      `,
      [itemId, fieldId]
    );

    return (result?.count ?? 0) > 0;
  }

  async setValue(
    itemId: string,
    fieldId: string,
    value: string | null
  ): Promise<ItemValue> {
    const existing =
      await this.getByItemAndFieldIncludingDeleted(
        itemId,
        fieldId
      );

    if (!existing) {
      return this.create(itemId, fieldId, value);
    }

    const updatedAt = now();

    const result = await this.execute(
      `
      UPDATE item_values
      SET
        value = ?,
        updatedAt = ?,
        deletedAt = NULL
      WHERE id = ?
      `,
      [value, updatedAt, existing.id]
    );

    if (result.changes !== 1) {
      throw new Error("Failed to set item value");
    }

    return {
      ...existing,
      value,
      updatedAt,
      deletedAt: null,
    };
  }

  async deleteByItemAndField(
    itemId: string,
    fieldId: string
  ): Promise<void> {
    const existing = await this.getByItemAndField(
      itemId,
      fieldId
    );

    if (!existing) {
      return;
    }

    await this.softDelete(existing.id);
  }
}

export const itemValueRepository =
  new ItemValueRepository();