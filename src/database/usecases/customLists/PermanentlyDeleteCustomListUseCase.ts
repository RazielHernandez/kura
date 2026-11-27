import { customListRepository } from "../../repositories/CustomListRepository";

export class PermanentlyDeleteCustomListUseCase {
  async execute(listId: string): Promise<void> {
    const id = listId.trim();

    if (!id) {
      throw new Error("Custom list ID is required.");
    }

    const existing =
      await customListRepository.getByIdIncludingDeleted(id);

    if (!existing) {
      throw new Error(`Custom list not found: ${id}`);
    }

    if (!existing.deletedAt) {
      throw new Error(
        "Only deleted custom lists can be permanently deleted."
      );
    }

    await customListRepository.hardDelete(id);
  }
}

export const permanentlyDeleteCustomListUseCase = new PermanentlyDeleteCustomListUseCase();