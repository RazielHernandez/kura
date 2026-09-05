import { Tag } from "../../models/Tag";
import { tagRepository } from "../../repositories/TagRepository";
import { collectionRepository } from "../../repositories/CollectionRepository";

export interface CreateTagInput {
  collectionId: string;
  name: string;
  color?: string | null;
}

export class CreateTagUseCase {
  async execute(
    input: CreateTagInput
  ): Promise<Tag> {
    const collectionId = input.collectionId.trim();
    const name = input.name.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!name) {
      throw new Error("Tag name is required");
    }

    const collection =
      await collectionRepository.getById(collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const existing =
      await tagRepository.getByNameIncludingDeleted(
        collectionId,
        name
      );

    if (existing) {
      if (!existing.deletedAt) {
        throw new Error(
          `A tag with the name "${name}" already exists in this collection`
        );
      }

      await tagRepository.restore(existing.id);

      const restored =
        await tagRepository.getById(existing.id);

      if (!restored) {
        throw new Error(
          "Tag could not be restored"
        );
      }

      return restored;
    }

    return tagRepository.create(
      collectionId,
      name,
      {
        color: input.color ?? null,
      }
    );
  }
}

export const createTagUseCase =
  new CreateTagUseCase();