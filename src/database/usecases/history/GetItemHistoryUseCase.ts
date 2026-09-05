import { ItemHistory } from "../../models/ItemHistory";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemHistoryRepository } from "../../repositories/ItemHistoryRepository";

export class GetItemHistoryUseCase {
  async execute(
    itemId: string
  ): Promise<ItemHistory[]> {
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

    return itemHistoryRepository.getByItemId(
      normalizedItemId
    );
  }
}

export const getItemHistoryUseCase =
  new GetItemHistoryUseCase();