import { ItemWithCollection } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

export class GetFavoriteItemsUseCase {
  async execute(): Promise<ItemWithCollection[]> {
    return itemRepository.getAllFavoriteItems();
  }
}

export const getFavoriteItemsUseCase = new GetFavoriteItemsUseCase();