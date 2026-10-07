import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemRepository } from "../../../repositories/ItemRepository";

export interface PurchaseItemWorkflowInput {
  itemId: string;
  description?: string | null;
}

export class PurchaseItemWorkflow {
  async execute(
    input: PurchaseItemWorkflowInput
  ): Promise<void> {
    /*
     * Find the active item.
     */
    const item =
      await itemRepository.getById(
        input.itemId
      );

    if (!item) {
      throw new Error("Item not found");
    }

    /*
     * Prepare optional description.
     */
    const description =
      input.description?.trim() || null;

    /*
     * Record the purchase as one atomic
     * business operation.
     */
    await databaseService.transaction(async () => {
      const historyDescription =
        description
          ? `Item "${item.name}" was purchased - ${description}`
          : `Item "${item.name}" was purchased`;

      await itemHistoryRepository.create(
        item.id,
        "PURCHASED",
        historyDescription
      );
    });
  }
}

export const purchaseItemWorkflow = new PurchaseItemWorkflow();