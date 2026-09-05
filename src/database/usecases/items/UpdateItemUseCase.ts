import { Item } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

export interface UpdateItemInput {
  id: string;
  name?: string;
  description?: string | null;
  favorite?: boolean;
}

export class UpdateItemUseCase {
  async execute(
    input: UpdateItemInput
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

    let name = existing.name;

    if (input.name !== undefined) {
      name = input.name.trim();

      if (!name) {
        throw new Error("Item name is required");
      }

      if (name !== existing.name) {
        const exists =
          await itemRepository.existsByName(
            existing.collectionId,
            name
          );

        if (exists) {
          throw new Error(
            `An item with the name "${name}" already exists in this collection`
          );
        }
      }
    }

    const updated =
      await itemRepository.update(
        id,
        {
          name,
          description:
            input.description !== undefined
              ? input.description?.trim() || undefined
              : undefined,
          favorite: input.favorite,
        }
      );

    if (!updated) {
      throw new Error("Item could not be updated");
    }

    return updated;
  }
}

export const updateItemUseCase =
  new UpdateItemUseCase();