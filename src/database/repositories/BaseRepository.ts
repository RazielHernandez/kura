import { SQLiteDatabase } from "expo-sqlite";
import { BaseEntity } from "../models/BaseEntity";
import { now } from "../utils/DateUtils";
import { databaseService } from "../DatabaseService";

export abstract class BaseRepository<T extends BaseEntity> {
    
  protected readonly db = databaseService.connection;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getById(id: string): Promise<T | null> {
    const row = await this.db.getFirstAsync<T>(
      `
      SELECT *
      FROM ${this.tableName}
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [id]
    );

    return row ?? null;
  }

  async getAll(): Promise<T[]> {
    return await this.db.getAllAsync<T>(
      `
      SELECT *
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      ORDER BY updatedAt DESC
      `
    );
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE id = ?
        AND deletedAt IS NULL
      `,
      [id]
    );

    return (row?.count ?? 0) > 0;
  }

  async softDelete(id: string): Promise<void> {
    await this.db.runAsync(
      `
      UPDATE ${this.tableName}
      SET
        deletedAt = ?,
        updatedAt = ?
      WHERE id = ?
      `,
      [now(), now(), id]
    );
  }

  async restore(id: string): Promise<void> {
    await this.db.runAsync(
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
    await this.db.runAsync(
      `
      DELETE FROM ${this.tableName}
      WHERE id = ?
      `,
      [id]
    );
  }

  async count(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM ${this.tableName}
      WHERE deletedAt IS NULL
      `
    );

    return row?.count ?? 0;
  }

  protected async execute(
    sql: string,
    params: any[] = []
    ) {
    return this.db.runAsync(sql, params);
  }

  protected async query<R>(
    sql: string,
    params: any[] = []
    ): Promise<R[]> {
    return this.db.getAllAsync<R>(sql, params);
  }
}