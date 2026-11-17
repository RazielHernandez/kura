
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { itemValueRepository } from "../../repositories/ItemValueRepository";

export class DeleteCollectionFieldUseCase {
  async execute(id: string): Promise<void> {
    const fieldId = id.trim();

    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    const existing =
      await collectionFieldRepository.getById(fieldId);

    if (!existing) {
      throw new Error("Field not found");
    }

    const values =
      await itemValueRepository.getNonEmptyByFieldIdForActiveItems(
        fieldId
      );

    if (values.length > 0) {
      throw new Error(
        `Cannot delete "${existing.name}" because active items contain values for this field. Remove those values from the items first.`
      );
    }

    await collectionFieldRepository.softDelete(fieldId);
  }
}

export const deleteCollectionFieldUseCase = new DeleteCollectionFieldUseCase();
