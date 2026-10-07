import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

export interface LendItemWorkflowInput {
  itemId: string;
  description?: string | null;
}

export class LendItemWorkflow {
  async execute(
    input: LendItemWorkflowInput
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
          ? `Item "${item.name}" was lent - ${description}`
          : `Item "${item.name}" was lent`;

      await itemHistoryRepository.create(
        item.id,
        "LENT",
        historyDescription
      );
    });
  }
}

export const lendItemWorkflow = new LendItemWorkflow();