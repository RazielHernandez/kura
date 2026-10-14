export interface ValidateCollectionInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  requireName?: boolean;
}

export interface ValidatedCollectionInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MAX_ICON_LENGTH = 100;

export class ValidateCollectionUseCase {
  execute(input: ValidateCollectionInput): ValidatedCollectionInput {
    const validated: ValidatedCollectionInput = {};

    if (input.requireName && input.name === undefined) {
      throw new Error("Collection name is required");
    }

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Collection name cannot be empty");
      }

      if (name.length > MAX_NAME_LENGTH) {
        throw new Error(
          `Collection name cannot exceed ${MAX_NAME_LENGTH} characters`
        );
      }

      validated.name = name;
    }

    if (input.description !== undefined) {
      const description = input.description?.trim() ?? "";

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(
          `Collection description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`
        );
      }

      validated.description = description || null;
    }

    if (input.icon !== undefined) {
      const icon = input.icon?.trim() ?? "";

      if (icon.length > MAX_ICON_LENGTH) {
        throw new Error(
          `Collection icon cannot exceed ${MAX_ICON_LENGTH} characters`
        );
      }

      validated.icon = icon || null;
    }

    if (input.color !== undefined) {
      const color = input.color?.trim() ?? "";

      if (
        color &&
        !/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)
      ) {
        throw new Error(
          "Collection color must be a valid hexadecimal color"
        );
      }

      validated.color = color || null;
    }

    return validated;
  }
}

export const validateCollectionUseCase = new ValidateCollectionUseCase();