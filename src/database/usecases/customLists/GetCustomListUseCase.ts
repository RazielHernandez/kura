import { CustomList } from "../../models/CustomList";
import { customListRepository } from "../../repositories/CustomListRepository";

export class GetCustomListUseCase {
  async execute(
    listId: string
  ): Promise<CustomList> {
    const id = listId.trim();

    if (!id) {
      throw new Error("Custom list ID is required");
    }

    const list =
      await customListRepository.getById(id);

    if (!list) {
      throw new Error(`Custom list not found: ${id}`);
    }

    return list;
  }
}

export const getCustomListUseCase =
  new GetCustomListUseCase();