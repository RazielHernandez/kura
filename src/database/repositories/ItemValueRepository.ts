import { BaseRepository } from "./BaseRepository";
import { ItemValue } from "../models/ItemValue";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

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

    await this.execute(
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

    if (existing) {
      const updatedAt = now();

      await this.execute(
        `
        UPDATE item_values
        SET
          value = ?,
          updatedAt = ?,
          deletedAt = NULL
        WHERE id = ?
        `,
        [
          value,
          updatedAt,
          existing.id,
        ]
      );

      return {
        ...existing,
        value,
        updatedAt,
        deletedAt: null,
      };
    }

    return this.create(
      itemId,
      fieldId,
      value
    );
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