import { ItemValue } from "../../models/ItemValue";
import { itemValueRepository } from "../../repositories/ItemValueRepository";
import { itemRepository } from "../../repositories/ItemRepository";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";

export class GetItemValueUseCase {
  async execute(
    itemId: string,
    fieldId: string
  ): Promise<ItemValue | null> {
    const item = itemId.trim();
    const field = fieldId.trim();

    if (!item) {
      throw new Error("Item ID is required");
    }

    if (!field) {
      throw new Error("Field ID is required");
    }

    const existingItem =
      await itemRepository.getById(item);

    if (!existingItem) {
      throw new Error("Item not found");
    }

    const existingField =
      await collectionFieldRepository.getById(field);

    if (!existingField) {
      throw new Error("Collection field not found");
    }

    if (
      existingField.collectionId !==
      existingItem.collectionId
    ) {
      throw new Error(
        "Collection field does not belong to the item's collection"
      );
    }

    return itemValueRepository.getByItemAndField(
      item,
      field
    );
  }
}

export const getItemValueUseCase =
  new GetItemValueUseCase();