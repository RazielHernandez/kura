import { databaseService } from "../../../DatabaseService";

import { itemRepository } from "../../../repositories/ItemRepository";
import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";

import { ItemNote } from "../../../models/ItemNote";
import { createItemNoteUseCase } from "../../notes/CreateItemNoteUseCase";

export interface CreateItemNoteWorkflowInput {
  itemId: string;
  content: string;
}

export class CreateItemNoteWorkflow {
  async execute(
    input: CreateItemNoteWorkflowInput
  ): Promise<ItemNote> {
    return databaseService.transaction(async () => {
      const item = await itemRepository.getById(input.itemId);

      if (!item) {
        throw new Error("Item not found");
      }

      const note = await createItemNoteUseCase.execute(input);

      await itemHistoryRepository.create(
        item.id,
        "CUSTOM",
        `A note was added to item "${item.name}"`
      );

      return note;
    });
  }
}

export const createItemNoteWorkflow =
  new CreateItemNoteWorkflow();