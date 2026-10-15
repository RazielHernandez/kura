
import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export class RestoreItemNoteUseCase {
  async execute(noteId: string): Promise<void> {
    const id = noteId.trim();

    if (!id) {
      throw new Error("Note ID is required");
    }

    const note =
      await itemNoteRepository.getByIdIncludingDeleted(id);

    if (!note) {
      throw new Error(`Note not found: ${id}`);
    }

    if (!note.deletedAt) {
      throw new Error(`Note is not deleted: ${id}`);
    }

    await itemNoteRepository.restore(id);
  }
}

export const restoreItemNoteUseCase =
  new RestoreItemNoteUseCase();
