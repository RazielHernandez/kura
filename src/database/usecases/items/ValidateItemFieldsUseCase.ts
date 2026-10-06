import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export interface ValidateItemFieldsInput {
  collectionId: string;
  fieldIds: string[];
}

export class ValidateItemFieldsUseCase {
  async execute(
    input: ValidateItemFieldsInput
  ): Promise<void> {
    const uniqueFieldIds = [
      ...new Set(input.fieldIds),
    ];

    for (const fieldId of uniqueFieldIds) {
      const field =
        await collectionFieldRepository.getById(
          fieldId
        );

      if (!field) {
        throw new Error(
          `Field not found: ${fieldId}`
        );
      }

      if (field.collectionId !== input.collectionId) {
        throw new Error(
          `Field "${field.name}" does not belong to this collection`
        );
      }
    }
  }
}

export const validateItemFieldsUseCase = new ValidateItemFieldsUseCase();