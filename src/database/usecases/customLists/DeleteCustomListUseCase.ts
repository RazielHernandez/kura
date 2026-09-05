import { customListRepository } from "../../repositories/CustomListRepository";

export class DeleteCustomListUseCase {
  async execute(
    listId: string
  ): Promise<void> {
    const id = listId.trim();

    if (!id) {
      throw new Error("Custom list ID is required");
    }

    const existing =
      await customListRepository.getById(id);

    if (!existing) {
      throw new Error(`Custom list not found: ${id}`);
    }

    await customListRepository.softDelete(id);
  }
}

export const deleteCustomListUseCase =
  new DeleteCustomListUseCase();