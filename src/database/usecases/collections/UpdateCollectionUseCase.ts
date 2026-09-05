import { Collection } from "../../models/collection";
import { collectionRepository } from "../../repositories/CollectionRepository";

export interface UpdateCollectionInput {
  id: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export class UpdateCollectionUseCase {
  async execute(
    input: UpdateCollectionInput
  ): Promise<Collection> {
    if (!input.id.trim()) {
      throw new Error("Collection ID is required");
    }

    const existing = await collectionRepository.getById(input.id);

    if (!existing) {
      throw new Error("Collection not found");
    }

    let name = existing.name;

    if (input.name !== undefined) {
      name = input.name.trim();

      if (!name) {
        throw new Error("Collection name is required");
      }

      if (
        name !== existing.name &&
        await collectionRepository.existsByName(name)
      ) {
        throw new Error(
          `A collection with the name "${name}" already exists`
        );
      }
    }

    const updated = await collectionRepository.update(
      input.id,
      {
        name,
        icon: input.icon,
        color: input.color,
        description:
          input.description !== undefined
            ? input.description?.trim() || null
            : undefined,
        sortOrder: input.sortOrder,
      }
    );

    if (!updated) {
      throw new Error("Collection could not be updated");
    }

    return updated;
  }
}

export const updateCollectionUseCase =
  new UpdateCollectionUseCase();