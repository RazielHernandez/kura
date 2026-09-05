import { Collection } from "../../models/collection";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetCollectionsUseCase {
  async execute(): Promise<Collection[]> {
    return collectionRepository.getAllOrdered();
  }
}

export const getCollectionsUseCase =
  new GetCollectionsUseCase();