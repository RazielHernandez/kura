
import { collectionRepository } from "../../repositories/CollectionRepository";

export class PermanentlyDeleteCollectionUseCase {
  async execute(id: string): Promise<void> {
    const collectionId = id.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    const existing =
      await collectionRepository.getByIdIncludingDeleted(collectionId);

    if (!existing) {
      throw new Error("Collection not found");
    }

    if (!existing.deletedAt) {
      throw new Error(
        "Collection must be deleted before it can be permanently deleted"
      );
    }

    await collectionRepository.hardDelete(collectionId);
  }
}

export const permanentlyDeleteCollectionUseCase = new PermanentlyDeleteCollectionUseCase();
