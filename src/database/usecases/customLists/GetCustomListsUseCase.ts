import { CustomList } from "../../models/CustomList";
import { customListRepository } from "../../repositories/CustomListRepository";

export class GetCustomListsUseCase {
  async execute(): Promise<CustomList[]> {
    return customListRepository.getAll();
  }
}

export const getCustomListsUseCase =
  new GetCustomListsUseCase();