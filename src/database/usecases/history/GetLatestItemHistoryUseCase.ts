import { ItemHistory } from "../../models/ItemHistory";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemHistoryRepository } from "../../repositories/ItemHistoryRepository";

export class GetLatestItemHistoryUseCase {
  async execute(
    itemId: string
  ): Promise<ItemHistory | null> {
    const normalizedItemId = itemId.trim();

    if (!normalizedItemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(
      normalizedItemId
    );

    if (!item) {
      throw new Error(
        `Item not found: ${normalizedItemId}`
      );
    }

    return itemHistoryRepository.getLatest(
      normalizedItemId
    );
  }
}

export const getLatestItemHistoryUseCase =
  new GetLatestItemHistoryUseCase();