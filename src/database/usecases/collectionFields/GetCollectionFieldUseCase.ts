import { CollectionField } from "../../models/CollectionField";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export class GetCollectionFieldUseCase {
  async execute(
    id: string
  ): Promise<CollectionField | null> {
    if (!id.trim()) {
      throw new Error("Field ID is required");
    }

    return collectionFieldRepository.getById(id);
  }
}

export const getCollectionFieldUseCase =
  new GetCollectionFieldUseCase();