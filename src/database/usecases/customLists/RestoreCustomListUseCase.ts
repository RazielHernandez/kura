import { customListRepository } from "../../repositories/CustomListRepository";

export class RestoreCustomListUseCase {
  async execute(
    listId: string
  ): Promise<void> {
    const id = listId.trim();

    if (!id) {
      throw new Error("Custom list ID is required");
    }

    const exists =
      await customListRepository.existsIncludingDeleted(id);

    if (!exists) {
      throw new Error(`Custom list not found: ${id}`);
    }

    await customListRepository.restore(id);
  }
}

export const restoreCustomListUseCase =
  new RestoreCustomListUseCase();