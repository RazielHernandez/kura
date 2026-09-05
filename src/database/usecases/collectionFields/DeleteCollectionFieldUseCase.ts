import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export class DeleteCollectionFieldUseCase {
  async execute(id: string): Promise<void> {
    const fieldId = id.trim();

    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    const existing =
      await collectionFieldRepository.getById(fieldId);

    if (!existing) {
      throw new Error("Field not found");
    }

    await collectionFieldRepository.softDelete(fieldId);
  }
}

export const deleteCollectionFieldUseCase =
  new DeleteCollectionFieldUseCase();