import { databaseService } from "../../../DatabaseService";

import { itemRepository } from "../../../repositories/ItemRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { deleteItemNoteUseCase } from "../../notes/DeleteItemNoteUseCase";


export class DeleteItemNoteWorkflow {
  async execute(noteId: string): Promise<void> {
    await databaseService.transaction(async () => {
      const note = await itemNoteRepository.getById(noteId);

      if (!note) {
        throw new Error("Note not found");
      }

      const item = await itemRepository.getById(note.itemId);

      if (!item) {
        throw new Error("Item not found");
      }

      await deleteItemNoteUseCase.execute(noteId);

      await itemHistoryRepository.create(
        item.id,
        "CUSTOM",
        `A note was deleted from item "${item.name}"`
      );
    });
  }
}

export const deleteItemNoteWorkflow =
  new DeleteItemNoteWorkflow();