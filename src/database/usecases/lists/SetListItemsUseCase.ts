import { databaseService } from "../../DatabaseService";
import { itemRepository } from "../../repositories/ItemRepository";
import { customListRepository } from "../../repositories/CustomListRepository";
import { listItemRepository } from "../../repositories/ListItemRepository";

export interface SetListItemsInput {
  listId: string;
  itemIds: string[];
}

export class SetListItemsUseCase {
  async execute(
    input: SetListItemsInput
  ): Promise<void> {
    const listId = input.listId.trim();

    if (!listId) {
      throw new Error("Custom list ID is required");
    }

    const list =
      await customListRepository.getById(listId);

    if (!list) {
      throw new Error(`Custom list not found: ${listId}`);
    }

    const itemIds = [
      ...new Set(
        input.itemIds
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    // Validate all items before modifying the list.
    for (const itemId of itemIds) {
      const item =
        await itemRepository.getById(itemId);

      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }
    }

    await databaseService.transaction(async () => {
      await listItemRepository.setItemsForList(
        listId,
        itemIds
      );
    });
  }
}

export const setListItemsUseCase =
  new SetListItemsUseCase();