import { ItemNote } from "../../models/ItemNote";
import { itemRepository } from "../../repositories/ItemRepository";
import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export interface CreateItemNoteInput {
  itemId: string;
  content: string;
}

export class CreateItemNoteUseCase {
  async execute(
    input: CreateItemNoteInput
  ): Promise<ItemNote> {
    const itemId = input.itemId.trim();
    const content = input.content.trim();

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    if (!content) {
      throw new Error("Note content is required");
    }

    const item = await itemRepository.getById(itemId);

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return itemNoteRepository.create(
      itemId,
      content
    );
  }
}

export const createItemNoteUseCase =
  new CreateItemNoteUseCase();