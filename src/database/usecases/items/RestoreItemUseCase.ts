import { itemRepository } from "../../repositories/ItemRepository";

export class RestoreItemUseCase {
  async execute(id: string): Promise<void> {
    const itemId = id.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const item =
      await itemRepository.getByIdIncludingDeleted(itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    if (!item.deletedAt) {
      throw new Error("Item is not deleted");
    }

    await itemRepository.restore(itemId);
  }
}

export const restoreItemUseCase = new RestoreItemUseCase();