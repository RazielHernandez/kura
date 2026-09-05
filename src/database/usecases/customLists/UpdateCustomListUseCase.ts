import { CustomList } from "../../models/CustomList";
import { customListRepository } from "../../repositories/CustomListRepository";

export interface UpdateCustomListInput {
  id: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
}

export class UpdateCustomListUseCase {
  async execute(
    input: UpdateCustomListInput
  ): Promise<CustomList> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Custom list ID is required");
    }

    const existing =
      await customListRepository.getById(id);

    if (!existing) {
      throw new Error(`Custom list not found: ${id}`);
    }

    const name =
      input.name === undefined
        ? existing.name
        : input.name.trim();

    if (!name) {
      throw new Error(
        "Custom list name is required"
      );
    }

    if (name !== existing.name) {
      const duplicate =
        await customListRepository.existsByName(name);

      if (duplicate) {
        throw new Error(
          `A custom list with the name "${name}" already exists`
        );
      }
    }

    const updated =
      await customListRepository.update(id, {
        name,
        icon: input.icon,
        color: input.color,
      });

    if (!updated) {
      throw new Error(
        `Custom list could not be updated: ${id}`
      );
    }

    return updated;
  }
}

export const updateCustomListUseCase =
  new UpdateCustomListUseCase();