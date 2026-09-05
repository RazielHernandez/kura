import { Item } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetItemsByCollectionUseCase {
  async execute(
    collectionId: string
  ): Promise<Item[]> {
    const id = collectionId.trim();

    if (!id) {
      throw new Error("Collection ID is required");
    }

    const collection =
      await collectionRepository.getById(id);

    if (!collection) {
      throw new Error("Collection not found");
    }

    return itemRepository.getByCollectionId(id);
  }
}

export const getItemsByCollectionUseCase =
  new GetItemsByCollectionUseCase();