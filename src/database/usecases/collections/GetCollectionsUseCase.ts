import { Collection } from "../../models/Collection";
import { collectionRepository } from "../../repositories/CollectionRepository";

export class GetCollectionsUseCase {
  async execute(): Promise<Collection[]> {
    return collectionRepository.getAllOrdered();
  }
}

export const getCollectionsUseCase =
  new GetCollectionsUseCase();