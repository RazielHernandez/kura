import { Item } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

export class GetItemUseCase {
  async execute(
    id: string
  ): Promise<Item | null> {
    const itemId = id.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    return itemRepository.getById(itemId);
  }
}

export const getItemUseCase =
  new GetItemUseCase();