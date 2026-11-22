import { databaseService } from "../../database/DatabaseService";

export async function debugTagSearch() {
  const associations = await databaseService.query<{
    itemId: string;
    itemName: string;
    tagId: string;
    tagName: string;
    tagDeletedAt: string | null;
  }>(
    `
    SELECT
      i.id AS itemId,
      i.name AS itemName,
      t.id AS tagId,
      t.name AS tagName,
      t.deletedAt AS tagDeletedAt
    FROM item_tags it
    INNER JOIN items i ON i.id = it.itemId
    INNER JOIN tags t ON t.id = it.tagId
    WHERE i.deletedAt IS NULL
    ORDER BY i.name, t.name;
    `
  );

  console.log("TAG ASSOCIATIONS:", associations);

  const matches = await databaseService.query<{
    id: string;
    name: string;
    tagName: string;
  }>(
    `
    SELECT
      i.id,
      i.name,
      t.name AS tagName
    FROM items i
    INNER JOIN item_tags it ON it.itemId = i.id
    INNER JOIN tags t ON t.id = it.tagId
    WHERE i.deletedAt IS NULL
      AND t.deletedAt IS NULL
      AND t.name LIKE '%' || ? || '%';
    `,
    ["switch"]
  );

  console.log("TAG SEARCH MATCHES:", matches);

  const logs_one = await databaseService.query<{
    itename: string;
    tagName: string;
    tagDeletedAt: string | null;
  }>(
    `
    SELECT
        i.name AS itemName,
        t.name AS tagName,
        t.deletedAt AS tagDeletedAt
    FROM item_tags it
    INNER JOIN items i ON i.id = it.itemId
    INNER JOIN tags t ON t.id = it.tagId
    WHERE i.deletedAt IS NULL
    ORDER BY i.name, t.name;
    `
  )

  console.log("TAG ASSOCIATIONS LOGS:", logs_one);

  const logs_two = await databaseService.query<{
    id: string;
    name: string;
    tagName: string;
  }>(
    `SELECT
        i.id,
        i.name,
        t.name AS tagName
    FROM items i
    INNER JOIN item_tags it ON it.itemId = i.id
    INNER JOIN tags t ON t.id = it.tagId
    WHERE i.deletedAt IS NULL
    AND t.deletedAt IS NULL
    AND t.name LIKE '%important%';
    `
    )
  console.log("TAG SEARCH LOGS:", logs_two);
}