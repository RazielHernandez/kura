import { collectionRepository } from "../../repositories/CollectionRepository";

export class RestoreCollectionUseCase {
  async execute(id: string): Promise<void> {
    if (!id.trim()) {
      throw new Error("Collection ID is required");
    }

    const exists =
      await collectionRepository.existsIncludingDeleted(id);

    if (!exists) {
      throw new Error("Collection not found");
    }

    await collectionRepository.restore(id);
  }
}

export const restoreCollectionUseCase =
  new RestoreCollectionUseCase();