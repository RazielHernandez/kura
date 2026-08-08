import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migration/migrationRunner";

class DatabaseService {
  private readonly database: SQLite.SQLiteDatabase;

  constructor() {
    this.database = SQLite.openDatabaseSync("kura.db");
  }

  get connection(): SQLite.SQLiteDatabase {
    return this.database;
  }

  async initialize(): Promise<void> {
    console.log("Database: opening...");

    await this.database.execAsync(`
      PRAGMA foreign_keys = ON;
    `);

    console.log("Database: foreign keys enabled");

    await runMigrations(this.database);

    console.log("Database: migrations complete");
  }

  async execute(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ) {
    return this.database.runAsync(sql, params);
  }

  async query<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T[]> {
    return this.database.getAllAsync<T>(sql, params);
  }

  async queryFirst<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T | null> {
    return await this.database.getFirstAsync<T>(sql, params);
  }

  async debugTable(tableName: string): Promise<void> {
    const rows = await this.database.getAllAsync(
      `SELECT * FROM ${tableName}`
    );

    console.log(`DATABASE - ${tableName}:`, rows);
  }
}

export const databaseService = new DatabaseService();