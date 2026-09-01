export type DatabaseErrorType =
  | "CONSTRAINT"
  | "UNKNOWN";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly type: DatabaseErrorType,
    public readonly cause?: unknown
  ) {
    super(message);

    this.name = "DatabaseError";
  }
}

