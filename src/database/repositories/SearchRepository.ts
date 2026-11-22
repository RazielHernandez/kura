
import { BaseRepository } from "./BaseRepository";
import { BaseEntity } from "../models/BaseEntity";
import { CollectionSearchResult, ItemSearchResult, SearchMatchType } from "../models/ItemSearchResult";


interface ItemSearchRow {
  itemId: string;
  itemName: string;
  collectionId: string;
  collectionName: string;
  favorite: number;
  updatedAt: string;

  nameMatch: number;
  descriptionMatch: number;
  customFieldMatch: number;
  tagMatch: number;
  noteMatch: number;
}

interface CollectionSearchRow {
  collectionId: string;
  collectionName: string;
  description: string | null;
  nameMatch: number;
  descriptionMatch: number;
}

export class SearchRepository extends BaseRepository<BaseEntity> {
  constructor() {
    super("items");
  }

  private normalizeQuery(query: string): string {
    return query
      .trim()
      .replace(/[\\%_]/g, "\\$&");
  }

  async searchItems(query: string): Promise<ItemSearchResult[]> {
    const normalizedQuery = this.normalizeQuery(query);

    if (!normalizedQuery) {
      return [];
    }

    const pattern = `%${normalizedQuery}%`;

    const rows = await this.queryRaw<ItemSearchRow>(
      `
      WITH item_matches AS (
        SELECT
          i.id AS itemId,
          i.name AS itemName,
          i.collectionId,
          c.name AS collectionName,
          i.favorite,
          i.updatedAt,

          CASE
            WHEN i.name LIKE ? ESCAPE '\\' THEN 1
            ELSE 0
          END AS nameMatch,

          CASE
            WHEN i.description LIKE ? ESCAPE '\\' THEN 1
            ELSE 0
          END AS descriptionMatch,

          CASE WHEN EXISTS (
            SELECT 1
            FROM item_values iv
            INNER JOIN collection_fields cf
              ON cf.id = iv.fieldId
            WHERE iv.itemId = i.id
              AND iv.deletedAt IS NULL
              AND cf.deletedAt IS NULL
              AND (
                iv.value LIKE ? ESCAPE '\\'
                OR cf.name LIKE ? ESCAPE '\\'
              )
          ) THEN 1 ELSE 0 END AS customFieldMatch,

          CASE WHEN EXISTS (
            SELECT 1
            FROM item_tags it
            INNER JOIN tags t
              ON t.id = it.tagId
            WHERE it.itemId = i.id
              AND t.deletedAt IS NULL
              AND t.name LIKE ? ESCAPE '\\'
          ) THEN 1 ELSE 0 END AS tagMatch,

          CASE WHEN EXISTS (
            SELECT 1
            FROM item_notes n
            WHERE n.itemId = i.id
              AND n.deletedAt IS NULL
              AND n.content LIKE ? ESCAPE '\\'
          ) THEN 1 ELSE 0 END AS noteMatch

        FROM items i

        INNER JOIN collections c
          ON c.id = i.collectionId

        WHERE i.deletedAt IS NULL
          AND c.deletedAt IS NULL
      )

      SELECT *
      FROM item_matches

      WHERE nameMatch = 1
        OR descriptionMatch = 1
        OR customFieldMatch = 1
        OR tagMatch = 1
        OR noteMatch = 1

      ORDER BY
        nameMatch DESC,
        descriptionMatch DESC,
        updatedAt DESC
      `,
      [
        pattern,
        pattern,
        pattern,
        pattern,
        pattern,
        pattern,
      ]
    );

    return rows.map((row) => {
      const matchedBy: SearchMatchType[] = [];

      if (row.nameMatch) {
        matchedBy.push("item");
      }

      if (row.descriptionMatch) {
        matchedBy.push("description");
      }

      if (row.customFieldMatch) {
        matchedBy.push("customField");
      }

      if (row.tagMatch) {
        matchedBy.push("tag");
      }

      if (row.noteMatch) {
        matchedBy.push("note");
      }

      return {
        itemId: row.itemId,
        itemName: row.itemName,
        collectionId: row.collectionId,
        collectionName: row.collectionName,
        favorite: Boolean(row.favorite),
        updatedAt: row.updatedAt,
        matchedBy,
      };
    });
  }

  async searchCollections(
    query: string
  ): Promise<CollectionSearchResult[]> {
    const normalizedQuery = this.normalizeQuery(query);

    if (!normalizedQuery) {
      return [];
    }

    const pattern = `%${normalizedQuery}%`;

    const rows = await this.queryRaw<CollectionSearchRow>(
      `
      SELECT
        id AS collectionId,
        name AS collectionName,
        description,

        CASE
          WHEN name LIKE ? ESCAPE '\\' THEN 1
          ELSE 0
        END AS nameMatch,

        CASE
          WHEN description LIKE ? ESCAPE '\\' THEN 1
          ELSE 0
        END AS descriptionMatch

      FROM collections

      WHERE deletedAt IS NULL
        AND (
          name LIKE ? ESCAPE '\\'
          OR description LIKE ? ESCAPE '\\'
        )

      ORDER BY
        nameMatch DESC,
        collectionName ASC
      `,
      [
        pattern,
        pattern,
        pattern,
        pattern,
      ]
    );

    return rows.map((row) => ({
      collectionId: row.collectionId,
      collectionName: row.collectionName,
      description: row.description,
      matchedBy: row.nameMatch ? "name" : "description",
    }));
  }
}

export const searchRepository = new SearchRepository();