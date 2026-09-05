import { Item } from "../../models/Item";
import { collectionRepository } from "../../repositories/CollectionRepository";
import { itemRepository } from "../../repositories/ItemRepository";

export interface CreateItemInput {
  collectionId: string;
  name: string;
  description?: string | null;
  favorite?: boolean;
}

export class CreateItemUseCase {
  async execute(
    input: CreateItemInput
  ): Promise<Item> {
    const collectionId = input.collectionId.trim();
    const name = input.name.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!name) {
      throw new Error("Item name is required");
    }

    const collection =
      await collectionRepository.getById(collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    const exists =
      await itemRepository.existsByName(
        collectionId,
        name
      );

    if (exists) {
      throw new Error(
        `An item with the name "${name}" already exists in this collection`
      );
    }

    return itemRepository.create(
      collectionId,
      name,
      {
        description:
          input.description?.trim() || undefined,
        favorite: input.favorite ?? false,
      }
    );
  }
}

export const createItemUseCase =
  new CreateItemUseCase();