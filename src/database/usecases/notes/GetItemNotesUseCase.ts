import { ItemNote } from "../../models/ItemNote";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export class GetItemNotesUseCase {
  async execute(
    itemId: string
  ): Promise<ItemNote[]> {
    const normalizedItemId = itemId.trim();

    if (!normalizedItemId) {
      throw new Error("Item ID is required");
    }

    const item = await itemRepository.getById(
      normalizedItemId
    );

    if (!item) {
      throw new Error(
        `Item not found: ${normalizedItemId}`
      );
    }

    return itemNoteRepository.getByItemId(
      normalizedItemId
    );
  }
}

export const getItemNotesUseCase =
  new GetItemNotesUseCase();