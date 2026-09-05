import { ItemNote } from "../../models/ItemNote";
import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export class GetItemNoteUseCase {
  async execute(
    noteId: string
  ): Promise<ItemNote> {
    const id = noteId.trim();

    if (!id) {
      throw new Error("Note ID is required");
    }

    const note = await itemNoteRepository.getById(id);

    if (!note) {
      throw new Error(`Note not found: ${id}`);
    }

    return note;
  }
}

export const getItemNoteUseCase =
  new GetItemNoteUseCase();