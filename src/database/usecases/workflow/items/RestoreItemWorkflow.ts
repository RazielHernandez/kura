import { databaseService } from "../../../DatabaseService";
import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";
import { restoreItemUseCase } from "../../items/RestoreItemUseCase";

export class RestoreItemWorkflow {
  async execute(itemId: string): Promise<void> {
    await databaseService.transaction(async () => {
      const item =
        await itemRepository.getByIdIncludingDeleted(itemId);

      if (!item) {
        throw new Error("Item not found");
      }

      if (!item.deletedAt) {
        throw new Error("Item is not deleted");
      }

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