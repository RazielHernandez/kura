import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

export interface SellItemWorkflowInput {
  itemId: string;
  description?: string | null;
}

export class SellItemWorkflow {
  async execute(
    input: SellItemWorkflowInput
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
          ? `Item "${item.name}" was sold - ${description}`
          : `Item "${item.name}" was sold`;

      await itemHistoryRepository.create(
        item.id,
        "SOLD",
        historyDescription
      );
    });
  }
}

export const sellItemWorkflow = new SellItemWorkflow();