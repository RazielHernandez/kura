import {
  CollectionField,
  FieldType,
} from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { collectionRepository } from "../../repositories/CollectionRepository";

export interface CreateCollectionFieldInput {
  collectionId: string;
  name: string;
  fieldType: FieldType;
  required?: boolean;
  sortOrder?: number;
}

export class CreateCollectionFieldUseCase {
  async execute(
    input: CreateCollectionFieldInput
  ): Promise<CollectionField> {
    const collectionId = input.collectionId.trim();
    const name = input.name.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!name) {
      throw new Error("Field name is required");
    }

    const collection =
      await collectionRepository.getById(collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const exists =
      await collectionFieldRepository.existsByName(
        collectionId,
        name
      );

    if (exists) {
      throw new Error(
        `A field with the name "${name}" already exists in this collection`
      );
    }

    return collectionFieldRepository.create(
      collectionId,
      name,
      input.fieldType,
      {
        required: input.required ?? false,
        sortOrder: input.sortOrder,
      }
    );
  }
}

export const createCollectionFieldUseCase =
  new CreateCollectionFieldUseCase();