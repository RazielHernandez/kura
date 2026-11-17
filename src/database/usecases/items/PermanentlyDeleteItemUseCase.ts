import { itemRepository } from "../../repositories/ItemRepository";

export class PermanentlyDeleteItemUseCase {
  async execute(id: string): Promise<void> {
    const itemId = id.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const existing =
      await itemRepository.getByIdIncludingDeleted(itemId);

    if (!existing) {
      throw new Error("Item not found");
    }

    await itemRepository.hardDelete(itemId);
  }
}

export const permanentlyDeleteItemUseCase = new PermanentlyDeleteItemUseCase();