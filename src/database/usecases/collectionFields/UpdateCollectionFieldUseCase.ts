
import { CollectionField } from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { validateCollectionFieldsUseCase } from "./ValidateCollectionFieldsUseCase";

export interface UpdateCollectionFieldInput {
  id: string;
  name?: string;
  fieldType?: CollectionField["fieldType"];
  required?: boolean;
  sortOrder?: number;
}

export class UpdateCollectionFieldUseCase {
  async execute(
    input: UpdateCollectionFieldInput
  ): Promise<CollectionField> {
    const existing = await collectionFieldRepository.getById(input.id);

    if (!existing) {
      throw new Error("Collection field not found");
    }

    const name = input.name ?? existing.name;
    const fieldType = input.fieldType ?? existing.fieldType;

    validateCollectionFieldsUseCase.execute([
      {
        name,
        fieldType,
        required: input.required ?? existing.required,
      },
    ]);

    if (input.name !== undefined) {
      const duplicate = await collectionFieldRepository.existsByName(
        existing.collectionId,
        name,
        existing.id
      );

      if (duplicate) {
        throw new Error(
          `A field with the name "${name.trim()}" already exists in this collection`
        );
      }
    }

    const updatedField = await collectionFieldRepository.update(input.id, {
      name: input.name?.trim(),
      fieldType: input.fieldType,
      required: input.required,
      sortOrder: input.sortOrder,
    });

    if (!updatedField) {
      throw new Error("Failed to update collection field");
    }

    return updatedField;
  }
}

export const updateCollectionFieldUseCase = new UpdateCollectionFieldUseCase();