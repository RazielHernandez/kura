import { ItemWithCollection } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

export class GetAllItemsWithCollectionUseCase {
  async execute(): Promise<ItemWithCollection[]> {
    return itemRepository.getAllWithCollection();
  }
}

export const getAllItemsWithCollectionUseCase = new GetAllItemsWithCollectionUseCase();