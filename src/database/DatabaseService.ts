import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migration/migrationRunner";

import { DatabaseError } from "./error/DatabaseError";

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
    try {
      return await this.database.runAsync(sql, params);
    } catch (error) {
      throw this.toDatabaseError(error);
    }
  }

  async query<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T[]> {
    try {
      return await this.database.getAllAsync<T>(sql, params);
    } catch (error) {
      throw this.toDatabaseError(error);
    }
  }

  async queryFirst<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T | null> {
    try {
      return await this.database.getFirstAsync<T>(sql, params);
    } catch (error) {
      throw this.toDatabaseError(error);
    }
  }

  async transaction<T>(
    callback: () => Promise<T>
  ): Promise<T> {
    let result!: T;

    try {
      await this.database.withTransactionAsync(async () => {
        result = await callback();
      });

      return result;
    } catch (error) {
      throw this.toDatabaseError(error);
    }
  }

  async testTransaction(): Promise<void> {
    await this.transaction(async () => {
      await this.execute(
        `
          INSERT INTO collections (
            id,
            name,
            createdAt,
            updatedAt
          )
          VALUES (
            'test-transaction',
            'Test Transaction',
            datetime('now'),
            datetime('now')
          )
        `
      );

      throw new Error("Transaction test");
    });
  }

  async debugTable(tableName: string): Promise<void> {
    const rows = await this.database.getAllAsync(
      `SELECT * FROM ${tableName}`
    );

    console.log(`DATABASE - ${tableName}:`, rows);
  }

  private toDatabaseError(error: unknown): DatabaseError {
    if (error instanceof DatabaseError) {
      return error;
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (
      message.includes("UNIQUE constraint failed") ||
      message.includes("FOREIGN KEY constraint failed") ||
      message.includes("NOT NULL constraint failed") ||
      message.includes("CHECK constraint failed")
    ) {
      return new DatabaseError(
        message,
        "CONSTRAINT",
        error
      );
    }

    return new DatabaseError(
      message,
      "UNKNOWN",
      error
    );
  }
}

export const databaseService = new DatabaseService();