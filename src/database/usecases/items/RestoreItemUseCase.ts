import { itemRepository } from "../../repositories/ItemRepository";

export class RestoreItemUseCase {
  async execute(id: string): Promise<void> {
    const itemId = id.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const exists =
      await itemRepository.existsIncludingDeleted(itemId);

    if (!exists) {
      throw new Error("Item not found");
    }

    await itemRepository.restore(itemId);
  }
}

export const restoreItemUseCase =
  new RestoreItemUseCase();