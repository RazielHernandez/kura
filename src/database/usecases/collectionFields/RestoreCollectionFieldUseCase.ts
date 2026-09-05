import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export class RestoreCollectionFieldUseCase {
  async execute(id: string): Promise<void> {
    const fieldId = id.trim();

    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    const exists =
      await collectionFieldRepository.existsIncludingDeleted(
        fieldId
      );

    if (!exists) {
      throw new Error("Field not found");
    }

    await collectionFieldRepository.restore(fieldId);
  }
}

export const restoreCollectionFieldUseCase =
  new RestoreCollectionFieldUseCase();