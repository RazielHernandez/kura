import { Collection } from "../../models/collection";
import { collectionRepository } from "../../repositories/CollectionRepository";

export interface CreateCollectionInput {
  name: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export class CreateCollectionUseCase {
  async execute(
    input: CreateCollectionInput
  ): Promise<Collection> {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Collection name is required");
    }

    const exists = await collectionRepository.existsByName(name);

    if (exists) {
      throw new Error(
        `A collection with the name "${name}" already exists`
      );
    }

    return collectionRepository.create(name, {
      icon: input.icon ?? null,
      color: input.color ?? null,
      description: input.description?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
    });
  }
}

export const createCollectionUseCase =
  new CreateCollectionUseCase();