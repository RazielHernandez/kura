import {
  CollectionField,
  FieldType,
} from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export interface UpdateCollectionFieldInput {
  id: string;
  name?: string;
  fieldType?: FieldType;
  required?: boolean;
  sortOrder?: number;
}

export class UpdateCollectionFieldUseCase {
  async execute(
    input: UpdateCollectionFieldInput
  ): Promise<CollectionField> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Field ID is required");
    }

    const existing =
      await collectionFieldRepository.getById(id);

    if (!existing) {
      throw new Error("Field not found");
    }

    let name = existing.name;

    if (input.name !== undefined) {
      name = input.name.trim();

      if (!name) {
        throw new Error("Field name is required");
      }

      if (name !== existing.name) {
        const exists =
          await collectionFieldRepository.existsByName(
            existing.collectionId,
            name
          );

        if (exists) {
          throw new Error(
            `A field with the name "${name}" already exists in this collection`
          );
        }
      }
    }

    const updated =
      await collectionFieldRepository.update(
        id,
        {
          name,
          fieldType: input.fieldType,
          required: input.required,
          sortOrder: input.sortOrder,
        }
      );

    if (!updated) {
      throw new Error("Field could not be updated");
    }

    return updated;
  }
}

export const updateCollectionFieldUseCase =
  new UpdateCollectionFieldUseCase();