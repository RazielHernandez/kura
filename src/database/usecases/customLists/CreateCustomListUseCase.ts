import { CustomList } from "../../models/CustomList";
import { customListRepository } from "../../repositories/CustomListRepository";

export interface CreateCustomListInput {
  name: string;
  icon?: string | null;
  color?: string | null;
}

export class CreateCustomListUseCase {
  async execute(
    input: CreateCustomListInput
  ): Promise<CustomList> {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Custom list name is required");
    }

    const exists =
      await customListRepository.existsByName(name);

    if (exists) {
      throw new Error(
        `A custom list with the name "${name}" already exists`
      );
    }

    return customListRepository.create(
      name,
      {
        icon: input.icon ?? null,
        color: input.color ?? null,
      }
    );
  }
}

export const createCustomListUseCase =
  new CreateCustomListUseCase();