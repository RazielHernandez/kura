import { databaseService } from "../../../DatabaseService";

import { collectionRepository } from "../../../repositories/CollectionRepository";
import { restoreCollectionUseCase } from "../../collections/RestoreCollectionUseCase";

export class RestoreCollectionWorkflow {
  async execute(
    collectionId: string
  ): Promise<void> {
    const collection =
      await collectionRepository.getByIdIncludingDeleted(
        collectionId
      );

    if (!collection) {
      throw new Error("Collection not found");
    }

    if (!collection.deletedAt) {
      throw new Error(
        "Collection is not deleted"
      );
    }

    await databaseService.transaction(async () => {
      await restoreCollectionUseCase.execute(
        collectionId
      );
    });
  }
}

export const restoreCollectionWorkflow = new RestoreCollectionWorkflow();