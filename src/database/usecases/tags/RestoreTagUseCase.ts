import { tagRepository } from "../../repositories/TagRepository";

export class RestoreTagUseCase {
  async execute(id: string): Promise<void> {
    const tagId = id.trim();

    if (!tagId) {
      throw new Error("Tag ID is required");
    }

    const exists =
      await tagRepository.existsIncludingDeleted(tagId);

    if (!exists) {
      throw new Error("Tag not found");
    }

    await tagRepository.restore(tagId);
  }
}

export const restoreTagUseCase =
  new RestoreTagUseCase();