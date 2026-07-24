import { db } from "../database";
import { migrations } from "./";

export function runMigrations() {

    const versionResult = db.getFirstSync<{
        user_version: number;
    }>("PRAGMA user_version;");

    const currentVersion = versionResult?.user_version ?? 0;

    console.log("Current DB Version:", currentVersion);

    for (const migration of migrations) {

        if (migration.version > currentVersion) {

            console.log(
                `Running migration ${migration.version}: ${migration.name}`
            );

            db.execSync(migration.up);

            db.execSync(
                `PRAGMA user_version = ${migration.version};`
            );
        }
    }

    console.log("Database Ready");
}