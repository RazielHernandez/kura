import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

import { deleteItemUseCase } from "../../items/DeleteItemUseCase";

export class DeleteItemWorkflow {
  async execute(
    itemId: string
  ): Promise<void> {

    /*
     * Delete the item and create its history
     * entry as one atomic operation.
     */
    await databaseService.transaction(async () => {
      const currentItem = await itemRepository.getById(itemId);

      if (!currentItem) {
        throw new Error("Item not found");
      }

      await deleteItemUseCase.execute(itemId);

      await itemHistoryRepository.create(
        currentItem.id,
        "DELETED",
        `Item "${currentItem.name}" was deleted`
      );
    });
  }
}

export const deleteItemWorkflow = new DeleteItemWorkflow();