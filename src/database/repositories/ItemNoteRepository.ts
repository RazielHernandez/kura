import { BaseRepository } from "./BaseRepository";
import { ItemNote } from "../models/ItemNote";
import { generateId } from "../utils/UUID";
import { now } from "../utils/DateUtils";

export class ItemNoteRepository extends BaseRepository<ItemNote> {
  constructor() {
    super("item_notes");
  }

  async create(
    itemId: string,
    content: string
  ): Promise<ItemNote> {
    const id = generateId();
    const timestamp = now();

    const note: ItemNote = {
      id,
      itemId,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await this.execute(
      `
      INSERT INTO item_notes (
        id,
        itemId,
        content,
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        note.id,
        note.itemId,
        note.content,
        note.createdAt,
        note.updatedAt,
        note.deletedAt,
      ]
    );

    return note;
  }

  async update(
    id: string,
    content: string
  ): Promise<ItemNote | null> {
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updatedNote: ItemNote = {
      ...existing,
      content,
      updatedAt: now(),
    };

    await this.execute(
      `
      UPDATE item_notes
      SET
        content = ?,
        updatedAt = ?
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [
        updatedNote.content,
        updatedNote.updatedAt,
        id,
      ]
    );

    return updatedNote;
  }

  async getByItemId(
    itemId: string
  ): Promise<ItemNote[]> {
    return this.query(
      `
      SELECT *
      FROM item_notes
      WHERE itemId = ?
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      `,
      [itemId]
    );
  }

  async search(
    itemId: string,
    query: string
  ): Promise<ItemNote[]> {
    return this.query(
      `
      SELECT *
      FROM item_notes
      WHERE itemId = ?
        AND deletedAt IS NULL
        AND content LIKE ?
      ORDER BY updatedAt DESC
      `,
      [
        itemId,
        `%${query}%`,
      ]
    );
  }

  async existsIncludingDeleted(
    id: string
  ): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM item_notes
      WHERE id = ?
      `,
      [id]
    );

    return (result?.count ?? 0) > 0;
  }

  async deleteByItemId(
    itemId: string
  ): Promise<void> {
    const timestamp = now();

    await this.execute(
      `
      UPDATE item_notes
      SET
        deletedAt = ?,
        updatedAt = ?
      WHERE itemId = ?
        AND deletedAt IS NULL
      `,
      [
        timestamp,
        timestamp,
        itemId,
      ]
    );
  }
}

export const itemNoteRepository =
  new ItemNoteRepository();