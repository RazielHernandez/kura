import { Tag } from "../../models/Tag";
import { tagRepository } from "../../repositories/TagRepository";

export class GetTagUseCase {
  async execute(
    id: string
  ): Promise<Tag | null> {
    const tagId = id.trim();

    if (!tagId) {
      throw new Error("Tag ID is required");
    }

    return tagRepository.getById(tagId);
  }
}

export const getTagUseCase =
  new GetTagUseCase();