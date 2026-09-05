import { Tag } from "../../models/Tag";
import { tagRepository } from "../../repositories/TagRepository";

export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string | null;
}

export class UpdateTagUseCase {
  async execute(
    input: UpdateTagInput
  ): Promise<Tag> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Tag ID is required");
    }

    const existing =
      await tagRepository.getById(id);

    if (!existing) {
      throw new Error("Tag not found");
    }

    let name = existing.name;

    if (input.name !== undefined) {
      name = input.name.trim();

      if (!name) {
        throw new Error("Tag name is required");
      }

      if (name !== existing.name) {
        const exists =
          await tagRepository.existsByName(
            existing.collectionId,
            name
          );

        if (exists) {
          throw new Error(
            `A tag with the name "${name}" already exists in this collection`
          );
        }
      }
    }

    const updated =
      await tagRepository.update(
        id,
        {
          name,
          color: input.color,
        }
      );

    if (!updated) {
      throw new Error("Tag could not be updated");
    }

    return updated;
  }
}

export const updateTagUseCase =
  new UpdateTagUseCase();