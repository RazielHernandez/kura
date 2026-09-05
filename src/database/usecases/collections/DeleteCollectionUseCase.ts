import { collectionRepository } from "../../repositories/CollectionRepository";

export class DeleteCollectionUseCase {
  async execute(id: string): Promise<void> {
    if (!id.trim()) {
      throw new Error("Collection ID is required");
    }

    const existing = await collectionRepository.getById(id);

    if (!existing) {
      throw new Error("Collection not found");
    }

    await collectionRepository.softDelete(id);
  }
}

export const deleteCollectionUseCase =
  new DeleteCollectionUseCase();