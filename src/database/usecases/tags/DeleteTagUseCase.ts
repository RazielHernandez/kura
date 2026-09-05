import { tagRepository } from "../../repositories/TagRepository";

export class DeleteTagUseCase {
  async execute(id: string): Promise<void> {
    const tagId = id.trim();

    if (!tagId) {
      throw new Error("Tag ID is required");
    }

    const existing =
      await tagRepository.getById(tagId);

    if (!existing) {
      throw new Error("Tag not found");
    }

    await tagRepository.softDelete(tagId);
  }
}

export const deleteTagUseCase =
  new DeleteTagUseCase();