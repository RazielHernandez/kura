import { databaseService } from "../../../DatabaseService";
import { imageStorageService } from "../../../services/ImageStorageService";

export interface ClearAllDataResult {
  deletedFiles: number;
  failedFiles: number;
  fileErrors: string[];
}

class ClearAllDataWorkflow {
  async execute(): Promise<ClearAllDataResult> {
    // Step 1: Delete all database records in one transaction.
    await databaseService.transaction(async () => {
      const tables = [
        "item_tags",
        "list_items",
        "item_values",
        "item_images",
        "item_notes",
        "item_history",
        "collection_deletions",
        "items",
        "collection_fields",
        "tags",
        "custom_lists",
        "collections",
        "app_settings",
      ];

      for (const table of tables) {
        await databaseService.execute(
          `DELETE FROM ${table}`
        );
      }
    });

    // Step 2: Remove all managed image files.
    const managedImages =
      await imageStorageService.listManagedImages();

    const imageUris = [
      ...new Set([
        ...managedImages.originals,
        ...managedImages.thumbnails,
      ]),
    ];

    let deletedFiles = 0;
    let failedFiles = 0;
    const fileErrors: string[] = [];

    for (const uri of imageUris) {
      try {
        await imageStorageService.deleteManagedImageFile(uri);
        deletedFiles++;
      } catch (error) {
        failedFiles++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        fileErrors.push(`${uri}: ${message}`);

        console.warn(
          "Unable to delete managed image:",
          uri,
          error
        );
      }
    }

    return {
      deletedFiles,
      failedFiles,
      fileErrors,
    };
  }
}

export const clearAllDataWorkflow = new ClearAllDataWorkflow();