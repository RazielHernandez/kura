import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

import { restoreItemUseCase } from "../../items/RestoreItemUseCase";

export class RestoreItemWorkflow {
  async execute(
    itemId: string
  ): Promise<void> {
    /*
     * Unlike normal getById(), this also finds
     * soft-deleted items.
     */
    const item =
      await itemRepository.getByIdIncludingDeleted(
        itemId
      );

    if (!item) {
      throw new Error("Item not found");
    }

    /*
     * Prevent restoring an item that is already active.
     */
    if (!item.deletedAt) {
      throw new Error("Item is not deleted");
    }

    /*
     * Restore the item and record history
     * as one atomic operation.
     */
    await databaseService.transaction(async () => {
      await restoreItemUseCase.execute(itemId);

      await itemHistoryRepository.create(
        item.id,
        "RESTORED",
        `Item "${item.name}" was restored`
      );
    });
  }
}

export const restoreItemWorkflow = new RestoreItemWorkflow();