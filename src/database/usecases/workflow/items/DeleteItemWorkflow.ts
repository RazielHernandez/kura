import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

import { deleteItemUseCase } from "../../items/DeleteItemUseCase";

export class DeleteItemWorkflow {
  async execute(
    itemId: string
  ): Promise<void> {
    /*
     * Find the active item first.
     */
    const item =
      await itemRepository.getById(itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    /*
     * Delete the item and create its history
     * entry as one atomic operation.
     */
    await databaseService.transaction(async () => {
      await deleteItemUseCase.execute(itemId);

      await itemHistoryRepository.create(
        item.id,
        "DELETED",
        `Item "${item.name}" was deleted`
      );
    });
  }
}

export const deleteItemWorkflow = new DeleteItemWorkflow();