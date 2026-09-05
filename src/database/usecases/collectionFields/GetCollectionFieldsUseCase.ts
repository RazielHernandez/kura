import { CollectionField } from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetCollectionFieldsUseCase {
  async execute(
    collectionId: string
  ): Promise<CollectionField[]> {
    const id = collectionId.trim();

    if (!id) {
      throw new Error("Collection ID is required");
    }

    const collection =
      await collectionRepository.getById(id);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return collectionFieldRepository.getByCollectionId(id);
  }
}

export const getCollectionFieldsUseCase =
  new GetCollectionFieldsUseCase();