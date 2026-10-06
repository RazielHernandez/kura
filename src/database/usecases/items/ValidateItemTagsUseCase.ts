import { tagRepository } from "../../repositories/TagRepository";

export interface ValidateItemTagsInput {
  collectionId: string;
  tagIds: string[];
}

export class ValidateItemTagsUseCase {
  async execute(
    input: ValidateItemTagsInput
  ): Promise<void> {
    const uniqueTagIds = [
      ...new Set(input.tagIds),
    ];

    for (const tagId of uniqueTagIds) {
      const tag =
        await tagRepository.getById(tagId);

      if (!tag) {
        throw new Error(
          `Tag not found: ${tagId}`
        );
      }

      if (
        tag.collectionId !==
        input.collectionId
      ) {
        throw new Error(
          `Tag "${tag.name}" does not belong to this collection`
        );
      }
    }
  }
}

export const validateItemTagsUseCase = new ValidateItemTagsUseCase();