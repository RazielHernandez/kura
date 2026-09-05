import {
  ItemHistory,
  ItemHistoryType,
} from "../../models/ItemHistory";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemHistoryRepository } from "../../repositories/ItemHistoryRepository";

export interface CreateItemHistoryInput {
  itemId: string;
  type: ItemHistoryType;
  description?: string | null;
}

export class CreateItemHistoryUseCase {
  async execute(
    input: CreateItemHistoryInput
  ): Promise<ItemHistory> {
    const itemId = input.itemId.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const description =
      input.description?.trim() || null;

    return itemHistoryRepository.create(
      itemId,
      input.type,
      description
    );
  }
}

export const createItemHistoryUseCase =
  new CreateItemHistoryUseCase();