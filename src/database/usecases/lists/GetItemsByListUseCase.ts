import { Item } from "../../models/Item";
import { customListRepository } from "../../repositories/CustomListRepository";
import { listItemRepository } from "../../repositories/ListItemRepository";

export class GetItemsByListUseCase {
  async execute(
    listId: string
  ): Promise<Item[]> {
    const id = listId.trim();

    if (!id) {
      throw new Error("Custom list ID is required");
    }

    const list =
      await customListRepository.getById(id);

    if (!list) {
      throw new Error(`Custom list not found: ${id}`);
    }

    return listItemRepository.getItemsByListId(id);
  }
}

export const getItemsByListUseCase =
  new GetItemsByListUseCase();