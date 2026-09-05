import { Item } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

export interface SetItemFavoriteInput {
  id: string;
  favorite: boolean;
}

export class SetItemFavoriteUseCase {
  async execute(
    input: SetItemFavoriteInput
  ): Promise<Item> {
    const id = input.id.trim();

    if (!id) {
      throw new Error("Item ID is required");
    }

    const existing =
      await itemRepository.getById(id);

    if (!existing) {
      throw new Error("Item not found");
    }

    const updated =
      await itemRepository.setFavorite(
        id,
        input.favorite
      );

    if (!updated) {
      throw new Error(
        "Item favorite status could not be updated"
      );
    }

    return updated;
  }
}

export const setItemFavoriteUseCase =
  new SetItemFavoriteUseCase();