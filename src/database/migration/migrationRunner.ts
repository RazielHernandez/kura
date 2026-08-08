import * as SQLite from "expo-sqlite";
import { migrations } from "./index";

export async function runMigrations(
  db: SQLite.SQLiteDatabase
): Promise<void> {

  const versionResult = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version;");

  const currentVersion = versionResult?.user_version ?? 0;

  console.log(
    `Current database version: ${currentVersion}`
  );

  for (const migration of migrations) {

    if (migration.version <= currentVersion) {
      continue;
    }

    console.log(
      `Running migration ${migration.version}: ${migration.name}`
    );

    db.execSync(migration.up);

    db.execSync(
      `PRAGMA user_version = ${migration.version};`
    );
  }

  console.log("Database migrations complete");
}