import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export interface ValidateRequiredItemFieldsInput {
  collectionId: string;
  values: Array<{
    fieldId: string;
    value: string | null;
  }>;
}

export class ValidateRequiredItemFieldsUseCase {
  async execute(
    input: ValidateRequiredItemFieldsInput
  ): Promise<void> {
    const fields =
      await collectionFieldRepository.getByCollectionId(
        input.collectionId
      );

    const requiredFields = fields.filter(
      field => field.required
    );

    const valuesByFieldId = new Map(
      input.values.map(value => [
        value.fieldId,
        value.value,
      ])
    );

    const missingFields = requiredFields.filter(field => {
      const value = valuesByFieldId.get(field.id);

      return value == null || value.trim().length === 0;
    });

    if (missingFields.length > 0) {
      const names = missingFields
        .map(field => field.name)
        .join(", ");

      throw new Error(
        `Required fields are missing: ${names}`
      );
    }
  }
}

export const validateRequiredItemFieldsUseCase = new ValidateRequiredItemFieldsUseCase();