import { Tag } from "../../models/Tag";
import { tagRepository } from "../../repositories/TagRepository";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetTagsByCollectionUseCase {
  async execute(
    collectionId: string
  ): Promise<Tag[]> {
    const id = collectionId.trim();

    if (!id) {
      throw new Error("Collection ID is required");
    }

    const collection =
      await collectionRepository.getById(id);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return tagRepository.getByCollectionId(id);
  }
}

export const getTagsByCollectionUseCase =
  new GetTagsByCollectionUseCase();