import { ItemValue } from "../../models/ItemValue";
import {
  CollectionField,
  FieldType,
} from "../../models/CollectionField";
import { itemRepository } from "../../repositories/ItemRepository";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { itemValueRepository } from "../../repositories/ItemValueRepository";

export interface SetItemValueInput {
  itemId: string;
  fieldId: string;
  value: string | null;
}

export class SetItemValueUseCase {
  async execute(
    input: SetItemValueInput
  ): Promise<ItemValue> {
    const itemId = input.itemId.trim();
    const fieldId = input.fieldId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    const item =
      await itemRepository.getById(itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    const field =
      await collectionFieldRepository.getById(fieldId);

    if (!field) {
      throw new Error("Collection field not found");
    }

    if (field.collectionId !== item.collectionId) {
      throw new Error(
        "Collection field does not belong to the item's collection"
      );
    }

    const value = this.normalizeValue(
      input.value,
      field.fieldType
    );

    this.validateValue(
      value,
      field
    );

    return itemValueRepository.setValue(
      itemId,
      fieldId,
      value
    );
  }

  private normalizeValue(
    value: string | null,
    fieldType: FieldType
  ): string | null {
    if (value === null) {
      return null;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    return trimmed;
  }

  private validateValue(
    value: string | null,
    field: CollectionField
  ): void {
    if (value === null) {
      return;
    }

    switch (field.fieldType) {
      case "NUMBER":
        if (!Number.isInteger(Number(value))) {
          throw new Error(
            `Value for "${field.name}" must be a whole number`
          );
        }
        break;

      case "DECIMAL":
        if (!Number.isFinite(Number(value))) {
          throw new Error(
            `Value for "${field.name}" must be a number`
          );
        }
        break;

      case "BOOLEAN":
        if (value !== "true" && value !== "false") {
          throw new Error(
            `Value for "${field.name}" must be true or false`
          );
        }
        break;

      case "EMAIL":
        if (!this.isValidEmail(value)) {
          throw new Error(
            `Value for "${field.name}" must be a valid email`
          );
        }
        break;

      case "URL":
        if (!this.isValidUrl(value)) {
          throw new Error(
            `Value for "${field.name}" must be a valid URL`
          );
        }
        break;

      case "RATING": {
        const rating = Number(value);

        if (
          !Number.isInteger(rating) ||
          rating < 0 ||
          rating > 5
        ) {
          throw new Error(
            `Value for "${field.name}" must be a rating from 0 to 5`
          );
        }

        break;
      }

      case "DATE":
        if (!this.isValidDate(value)) {
          throw new Error(
            `Value for "${field.name}" must be a valid date`
          );
        }
        break;

      case "DATETIME":
        if (!this.isValidDateTime(value)) {
          throw new Error(
            `Value for "${field.name}" must be a valid date and time`
          );
        }
        break;

      case "PHONE":
      case "COLOR":
      case "TEXT":
        break;
    }
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDate(value: string): boolean {
    const date = new Date(value);

    return !Number.isNaN(date.getTime());
  }

  private isValidDateTime(value: string): boolean {
    const date = new Date(value);

    return !Number.isNaN(date.getTime());
  }
}

export const setItemValueUseCase =
  new SetItemValueUseCase();