import { itemRepository } from "../../repositories/ItemRepository";

export class DeleteItemUseCase {
  async execute(id: string): Promise<void> {
    const itemId = id.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const existing =
      await itemRepository.getById(itemId);

    if (!existing) {
      throw new Error("Item not found");
    }

    await itemRepository.softDelete(itemId);
  }
}

export const deleteItemUseCase =
  new DeleteItemUseCase();