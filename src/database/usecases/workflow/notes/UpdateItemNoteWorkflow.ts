import { databaseService } from "../../../DatabaseService";

import { itemRepository } from "../../../repositories/ItemRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";

import { ItemNote } from "../../../models/ItemNote";
import { updateItemNoteUseCase } from "../../notes/UpdateItemNoteUseCase";

export interface UpdateItemNoteWorkflowInput {
  noteId: string;
  content: string;
}

export class UpdateItemNoteWorkflow {
  async execute(
    input: UpdateItemNoteWorkflowInput
  ): Promise<ItemNote> {
    return databaseService.transaction(async () => {
      const existingNote = await itemNoteRepository.getById(
        input.noteId
      );

      if (!existingNote) {
        throw new Error("Note not found");
      }

      const item = await itemRepository.getById(
        existingNote.itemId
      );

      if (!item) {
        throw new Error("Item not found");
      }

      const updatedNote = await updateItemNoteUseCase.execute({
        id: input.noteId,
        content: input.content,
      });

      await itemHistoryRepository.create(
        item.id,
        "CUSTOM",
        `A note was updated on item "${item.name}"`
      );

      return updatedNote;
    });
  }
}

export const updateItemNoteWorkflow =
  new UpdateItemNoteWorkflow();