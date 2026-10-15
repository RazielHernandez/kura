import { itemNoteRepository } from "../../repositories/ItemNoteRepository";

export class DeleteItemNoteUseCase {
  async execute(
    noteId: string
  ): Promise<void> {
    const id = noteId.trim();

    if (!id) {
      throw new Error("Note ID is required");
    }

    await itemNoteRepository.softDelete(id);
  }
}

export const deleteItemNoteUseCase =
  new DeleteItemNoteUseCase();