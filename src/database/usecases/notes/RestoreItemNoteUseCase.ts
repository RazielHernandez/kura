import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export class RestoreItemNoteUseCase {
  async execute(
    noteId: string
  ): Promise<void> {
    const id = noteId.trim();

    if (!id) {
      throw new Error("Note ID is required");
    }

    const exists =
      await itemNoteRepository.existsIncludingDeleted(id);

    if (!exists) {
      throw new Error(`Note not found: ${id}`);
    }

    await itemNoteRepository.restore(id);
  }
}

export const restoreItemNoteUseCase =
  new RestoreItemNoteUseCase();