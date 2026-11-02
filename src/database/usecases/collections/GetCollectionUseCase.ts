import { Collection } from "../../models/Collection";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetCollectionUseCase {
  async execute(id: string): Promise<Collection | null> {
    if (!id.trim()) {
      throw new Error("Collection ID is required");
    }

    return collectionRepository.getById(id);
  }
}

export const getCollectionUseCase =
  new GetCollectionUseCase();