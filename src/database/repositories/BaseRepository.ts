import { BaseEntity } from "../models/BaseEntity";
import { databaseService } from "../DatabaseService";
import { now } from "../utils/DateUtils";
import * as SQLite from "expo-sqlite";

export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly db = databaseService.connection;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async execute(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ) {
    return databaseService.execute(sql, params);
  }

  protected async query<R>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<R[]> {
    return databaseService.query<R>(sql, params);
  }

  protected async queryFirst<R>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<R | null> {
    return databaseService.queryFirst<R>(sql, params);
  }

  async getById(id: string): Promise<T | null> {
    return this.queryFirst<T>(
      `
      SELECT *
      FROM ${this.tableName}
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [id]
    );
  }

  async getAll(): Promise<T[]> {
    return this.query<T>(
      `
      SELECT *
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      ORDER BY updatedAt DESC
      `
    );
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.queryFirst<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [id]
    );

    return (result?.count ?? 0) > 0;
  }

  async softDelete(id: string): Promise<void> {
    const timestamp = now();

    await this.execute(
      `
      UPDATE ${this.tableName}
      SET
        deletedAt = ?,
        updatedAt = ?
      WHERE id = ?
      `,
      [timestamp, timestamp, id]
    );
  }

  async restore(id: string): Promise<void> {
    await this.execute(
      `
      UPDATE ${this.tableName}
      SET
        deletedAt = NULL,
        updatedAt = ?
      WHERE id = ?
      `,
      [now(), id]
    );
  }

  async hardDelete(id: string): Promise<void> {
    await this.execute(
      `
      DELETE FROM ${this.tableName}
      WHERE id = ?
      `,
      [id]
    );
  }

  async count(): Promise<number> {
    const result = await this.queryFirst<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      `
    );

    return result?.count ?? 0;
  }
}