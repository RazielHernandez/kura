import { ItemNote } from "../../models/ItemNote";
import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export interface UpdateItemNoteInput {
  id: string;
  content: string;
}

export class UpdateItemNoteUseCase {
  async execute(
    input: UpdateItemNoteInput
  ): Promise<ItemNote> {
    const id = input.id.trim();
    const content = input.content.trim();

    if (!id) {
      throw new Error("Note ID is required");
    }

    if (!content) {
      throw new Error("Note content is required");
    }

    const existing = await itemNoteRepository.getById(id);

    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    const updated = await itemNoteRepository.update(
      id,
      content
    );

    if (!updated) {
      throw new Error(`Note could not be updated: ${id}`);
    }

    return updated;
  }
}

export const updateItemNoteUseCase =
  new UpdateItemNoteUseCase();