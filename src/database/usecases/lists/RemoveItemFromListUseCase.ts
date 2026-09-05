import { listItemRepository } from "../../repositories/ListItemRepository";

export interface RemoveItemFromListInput {
  listId: string;
  itemId: string;
}

export class RemoveItemFromListUseCase {
  async execute(
    input: RemoveItemFromListInput
  ): Promise<void> {
    const listId = input.listId.trim();
    const itemId = input.itemId.trim();

    if (!listId) {
      throw new Error("Custom list ID is required");
    }

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    await listItemRepository.remove(
      listId,
      itemId
    );
  }
}

export const removeItemFromListUseCase =
  new RemoveItemFromListUseCase();