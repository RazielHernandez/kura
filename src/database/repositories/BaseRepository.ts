import { BaseEntity } from "../models/BaseEntity";
import { databaseService } from "../DatabaseService";
import { now } from "../utils/DateUtils";
import * as SQLite from "expo-sqlite";

export abstract class BaseRepository<
  T extends BaseEntity,
  R = T
> {
  protected readonly db = databaseService.connection;
  protected readonly tableName: string;

  constructor(
    tableName: string,
    protected readonly mapRow: (row: R) => T = (row) =>
      row as unknown as T
  ) {
    this.tableName = tableName;
  }

  protected async execute(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ) {
    return databaseService.execute(sql, params);
  }

  protected async query(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T[]> {
    const rows = await databaseService.query<R>(sql, params);

    return rows.map(this.mapRow);
  }

  protected async queryFirst(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T | null> {
    const row = await databaseService.queryFirst<R>(sql, params);

    return row ? this.mapRow(row) : null;
  }

  protected async queryRaw<Q>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<Q[]> {
    return databaseService.query<Q>(sql, params);
  }

  protected async queryFirstRaw<Q>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<Q | null> {
    return databaseService.queryFirst<Q>(sql, params);
  }

  async getById(id: string): Promise<T | null> {
    return this.queryFirst(
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
    return this.query(
      `
      SELECT *
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      ORDER BY updatedAt DESC
      `
    );
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.queryFirstRaw<{ count: number }>(
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
    const result = await this.queryFirstRaw<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      `
    );

    return result?.count ?? 0;
  }
}