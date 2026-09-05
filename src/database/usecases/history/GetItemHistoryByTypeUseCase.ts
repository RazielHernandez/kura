import {
  ItemHistory,
  ItemHistoryType,
} from "../../models/ItemHistory";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemHistoryRepository } from "../../repositories/ItemHistoryRepository";

export interface GetItemHistoryByTypeInput {
  itemId: string;
  type: ItemHistoryType;
}

export class GetItemHistoryByTypeUseCase {
  async execute(
    input: GetItemHistoryByTypeInput
  ): Promise<ItemHistory[]> {
    const itemId = input.itemId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return itemHistoryRepository.getByType(
      itemId,
      input.type
    );
  }
}

export const getItemHistoryByTypeUseCase =
  new GetItemHistoryByTypeUseCase();