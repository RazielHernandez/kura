import { databaseService } from "../../../DatabaseService";

import { collectionRepository } from "../../../repositories/CollectionRepository";
import { deleteCollectionUseCase } from "../../collections/DeleteCollectionUseCase";

export class DeleteCollectionWorkflow {
  async execute(
    collectionId: string
  ): Promise<void> {
    const collection =
      await collectionRepository.getById(
        collectionId
      );

    if (!collection) {
      throw new Error("Collection not found");
    }

    await databaseService.transaction(async () => {
      await deleteCollectionUseCase.execute(
        collectionId
      );
    });
  }
}

export const deleteCollectionWorkflow = new DeleteCollectionWorkflow();