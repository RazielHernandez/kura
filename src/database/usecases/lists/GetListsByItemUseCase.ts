import { itemRepository } from "../../repositories/ItemRepository";
import { listItemRepository } from "../../repositories/ListItemRepository";

export class GetListsByItemUseCase {
  async execute(
    itemId: string
  ): Promise<string[]> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required");
    }

    const item =
      await itemRepository.getById(id);

    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    return listItemRepository.getListIdsByItemId(id);
  }
}

export const getListsByItemUseCase =
  new GetListsByItemUseCase();