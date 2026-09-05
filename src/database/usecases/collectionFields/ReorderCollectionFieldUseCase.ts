import { CollectionField } from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export interface ReorderCollectionFieldInput {
  id: string;
  sortOrder: number;
}

export class ReorderCollectionFieldUseCase {
  async execute(
    input: ReorderCollectionFieldInput
  ): Promise<CollectionField> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Field ID is required");
    }

    if (!Number.isInteger(input.sortOrder)) {
      throw new Error("Sort order must be an integer");
    }

    if (input.sortOrder < 0) {
      throw new Error("Sort order cannot be negative");
    }

    const existing =
      await collectionFieldRepository.getById(id);

    if (!existing) {
      throw new Error("Field not found");
    }

    const updated =
      await collectionFieldRepository.reorder(
        id,
        input.sortOrder
      );

    if (!updated) {
      throw new Error("Field could not be reordered");
    }

    return updated;
  }
}

export const reorderCollectionFieldUseCase =
  new ReorderCollectionFieldUseCase();