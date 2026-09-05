import { ItemValue } from "../../models/ItemValue";
import { itemValueRepository } from "../../repositories/ItemValueRepository";
import { itemRepository } from "../../repositories/ItemRepository";

export class GetItemValuesUseCase {
  async execute(
    itemId: string
  ): Promise<ItemValue[]> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required");
    }

    const item =
      await itemRepository.getById(id);

    if (!item) {
      throw new Error("Item not found");
    }

    return itemValueRepository.getByItemId(id);
  }
}

export const getItemValuesUseCase =
  new GetItemValuesUseCase();