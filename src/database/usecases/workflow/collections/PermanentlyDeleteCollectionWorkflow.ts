
import { databaseService } from "../../../DatabaseService";

import { collectionRepository } from "../../../repositories/CollectionRepository";

import { imageStorageService } from "../../../services/ImageStorageService";

import { permanentlyDeleteCollectionUseCase } from "../../collections/PermanentlyDeleteCollectionUseCase";

interface ImageRow {
  uri: string;
  thumbnailUri: string | null;
}

export class PermanentlyDeleteCollectionWorkflow {
  async execute(collectionId: string): Promise<void> {
    const id = collectionId.trim();

    if (!id) {
      throw new Error("Collection ID is required");
    }

    let images: ImageRow[] = [];

    await databaseService.transaction(async () => {
      const existing =
        await collectionRepository.getByIdIncludingDeleted(id);

      if (!existing) {
        throw new Error("Collection not found");
      }

      if (!existing.deletedAt) {
        throw new Error(
          "Collection must be deleted before permanent deletion"
        );
      }

      // Retrieve all images, including soft-deleted images
      // and images belonging to previously deleted items.
      images = await databaseService.query<ImageRow>(
        `
        SELECT
          item_images.uri,
          item_images.thumbnailUri
        FROM item_images
        INNER JOIN items
          ON items.id = item_images.itemId
        WHERE items.collectionId = ?
        `,
        [id]
      );

      // SQLite cascades the deletion to all dependent records,
      // including the collection deletion snapshot.
      await permanentlyDeleteCollectionUseCase.execute(id);
    });

    // Delete physical files only after the database transaction succeeds.
    const cleanupResults = await Promise.allSettled(
      images.map(image =>
        imageStorageService.deleteImage(
          image.uri,
          image.thumbnailUri
        )
      )
    );

    const failedCleanups = cleanupResults.filter(
      result => result.status === "rejected"
    );

    if (failedCleanups.length > 0) {
      throw new Error(
        `Collection was permanently deleted, but ${failedCleanups.length} image cleanup operation(s) failed.`
      );
    }
  }
}

export const permanentlyDeleteCollectionWorkflow = new PermanentlyDeleteCollectionWorkflow();
