import { tagRepository } from "../../repositories/TagRepository";

export interface ValidateItemTagsInput {
  collectionId: string;
  tagIds: string[];
}

export class ValidateItemTagsUseCase {
  async execute(
    input: ValidateItemTagsInput
  ): Promise<void> {
    const collectionId = input.collectionId.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!Array.isArray(input.tagIds)) {
      throw new Error("Tag IDs must be an array");
    }

    const tagIds = input.tagIds.map((id) =>
      typeof id === "string" ? id.trim() : ""
    );

    if (tagIds.some((id) => !id)) {
      throw new Error("Tag IDs cannot be empty");
    }

    if (new Set(tagIds).size !== tagIds.length) {
      throw new Error("Duplicate tag IDs are not allowed");
    }

    for (const tagId of tagIds) {
      const tag = await tagRepository.getById(tagId);

      if (!tag) {
        throw new Error(`Tag not found: ${tagId}`);
      }

      if (tag.collectionId !== collectionId) {
        throw new Error(
          `Tag "${tag.name}" does not belong to this collection`
        );
      }
    }
  }
}

export const validateItemTagsUseCase = new ValidateItemTagsUseCase();