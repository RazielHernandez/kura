
import { FieldType } from "../../models/CollectionField";

export interface ValidateCollectionFieldInput {
  name: string;
  fieldType: FieldType;
  required?: boolean;
}

const MAX_FIELD_NAME_LENGTH = 100;

const VALID_FIELD_TYPES: readonly FieldType[] = [
  "TEXT",
  "NUMBER",
  "DECIMAL",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "EMAIL",
  "PHONE",
  "URL",
  "COLOR",
  "RATING",
];

export class ValidateCollectionFieldsUseCase {
  execute(fields: ValidateCollectionFieldInput[]): void {
    if (!Array.isArray(fields)) {
      throw new Error("Collection fields must be an array");
    }

    const normalizedNames = new Set<string>();

    for (const field of fields) {
      if (!field || typeof field !== "object") {
        throw new Error("Each collection field must be a valid object");
      }

      if (
        !VALID_FIELD_TYPES.some(
          type => type === field.fieldType
        )
      ) {
        throw new Error(
          `Unsupported collection field type: ${String(field.fieldType)}`
        );
      }

      if (
        field.required !== undefined &&
        typeof field.required !== "boolean"
      ) {
        throw new Error("Field required must be a boolean");
      }

      if (typeof field.name !== "string") {
        throw new Error("Collection field name must be a string");
      }

      const name = field.name.trim();

      if (!name) {
        throw new Error("Collection field name cannot be empty");
      }

      if (name.length > MAX_FIELD_NAME_LENGTH) {
        throw new Error(
          `Collection field name cannot exceed ${MAX_FIELD_NAME_LENGTH} characters`
        );
      }

      const normalizedName = name.toLowerCase();

      if (normalizedNames.has(normalizedName)) {
        throw new Error(
          `Duplicate collection field name: "${name}"`
        );
      }

      normalizedNames.add(normalizedName);
    }
  }
}

export const validateCollectionFieldsUseCase = new ValidateCollectionFieldsUseCase();