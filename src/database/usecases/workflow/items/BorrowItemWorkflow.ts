import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

export interface BorrowItemWorkflowInput {
  itemId: string;
  description?: string | null;
}

export class BorrowItemWorkflow {
  async execute(
    input: BorrowItemWorkflowInput
  ): Promise<void> {
    const item =
      await itemRepository.getById(
        input.itemId
      );

    if (!item) {
      throw new Error("Item not found");
    }

    const description =
      input.description?.trim() || null;

    await databaseService.transaction(async () => {
      const historyDescription =
        description
          ? `Item "${item.name}" was borrowed - ${description}`
          : `Item "${item.name}" was borrowed`;

      await itemHistoryRepository.create(
        item.id,
        "BORROWED",
        historyDescription
      );
    });
  }
}

export const borrowItemWorkflow = new BorrowItemWorkflow();