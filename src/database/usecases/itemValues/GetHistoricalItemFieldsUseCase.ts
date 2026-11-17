import { HistoricalItemField } from "../../models/HistoricalItemField";
import { itemValueRepository } from "../../repositories/ItemValueRepository";

export class GetHistoricalItemFieldsUseCase {
  async execute(itemId: string): Promise<HistoricalItemField[]> {
    const id = itemId.trim();

    if (!id) {
      throw new Error("Item ID is required");
    }

    return itemValueRepository.getHistoricalFieldsByItemId(id);
  }
}

export const getHistoricalItemFieldsUseCase = new GetHistoricalItemFieldsUseCase();