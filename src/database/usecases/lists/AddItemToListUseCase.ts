import { itemRepository } from "../../repositories/ItemRepository";
import { customListRepository } from "../../repositories/CustomListRepository";
import { listItemRepository } from "../../repositories/ListItemRepository";

export interface AddItemToListInput {
  listId: string;
  itemId: string;
}

export class AddItemToListUseCase {
  async execute(
    input: AddItemToListInput
  ): Promise<void> {
    const listId = input.listId.trim();
    const itemId = input.itemId.trim();

    if (!listId) {
      throw new Error("Custom list ID is required");
    }

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const list =
      await customListRepository.getById(listId);

    if (!list) {
      throw new Error(`Custom list not found: ${listId}`);
    }

    const item =
      await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    await listItemRepository.add(
      listId,
      itemId
    );
  }
}

export const addItemToListUseCase =
  new AddItemToListUseCase();