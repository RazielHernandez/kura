import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

import { deleteItemUseCase } from "../../items/DeleteItemUseCase";

export class DeleteItemWorkflow {
  async execute(itemId: string): Promise<void> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required.");
    }

    const currentItem = await itemRepository.getById(id);

    if (!currentItem) {
      throw new Error("Item not found.");
    }

    await databaseService.transaction(async () => {
      await deleteItemUseCase.execute(id);

      await itemHistoryRepository.create(
        currentItem.id,
        "DELETED",
        `Item "${currentItem.name}" was deleted`
      );
    });
  }
}

export const deleteItemWorkflow = new DeleteItemWorkflow();
