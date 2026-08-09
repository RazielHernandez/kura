import { databaseService } from "../DatabaseService";

export class AppSettingsRepository {
  async get(
    key: string
  ): Promise<string | null> {
    const result =
      await databaseService.queryFirst<{ value: string | null }>(
        `
        SELECT value
        FROM app_settings
        WHERE key = ?
        LIMIT 1
        `,
        [key]
      );

    return result?.value ?? null;
  }

  async set(
    key: string,
    value: string | null
  ): Promise<void> {
    await databaseService.execute(
      `
      INSERT INTO app_settings (
        key,
        value
      )
      VALUES (?, ?)
      ON CONFLICT(key)
      DO UPDATE SET value = excluded.value
      `,
      [key, value]
    );
  }

  async remove(
    key: string
  ): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM app_settings
      WHERE key = ?
      `,
      [key]
    );
  }

  async exists(
    key: string
  ): Promise<boolean> {
    const result =
      await databaseService.queryFirst<{ count: number }>(
        `
        SELECT COUNT(*) as count
        FROM app_settings
        WHERE key = ?
        `,
        [key]
      );

    return (result?.count ?? 0) > 0;
  }

  async getAll(): Promise<
    Array<{
      key: string;
      value: string | null;
    }>
  > {
    return databaseService.query<{
      key: string;
      value: string | null;
    }>(
      `
      SELECT key, value
      FROM app_settings
      ORDER BY key ASC
      `
    );
  }

  async clear(): Promise<void> {
    await databaseService.execute(
      `
      DELETE FROM app_settings
      `
    );
  }

  async getBoolean(
    key: string,
    defaultValue = false
  ): Promise<boolean> {
    const value = await this.get(key);

    if (value === null) {
      return defaultValue;
    }

    return value === "true";
  }

  async setBoolean(
    key: string,
    value: boolean
  ): Promise<void> {
    await this.set(
      key,
      value ? "true" : "false"
    );
  }

  async getNumber(
    key: string,
    defaultValue = 0
  ): Promise<number> {
    const value = await this.get(key);

    if (value === null) {
      return defaultValue;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed)
      ? defaultValue
      : parsed;
  }

  async setNumber(
    key: string,
    value: number
  ): Promise<void> {
    await this.set(
      key,
      String(value)
    );
  }
}

export const appSettingsRepository =
  new AppSettingsRepository();