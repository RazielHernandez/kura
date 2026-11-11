
import { itemImageRepository } from "../repositories/ItemImageRepository";
import { imageStorageService } from "./ImageStorageService";

export interface ImageCleanupResult {
  deletedFiles: number;
  failedFiles: number;
}

class ImageStorageCleanupService {
  async cleanup(): Promise<ImageCleanupResult> {
    const images = await itemImageRepository.getAllIncludingDeleted();

    // Only active database records protect files from cleanup.
    const referencedFiles = new Set<string>();

    for (const image of images) {
      if (image.deletedAt !== null) {
        continue;
      }

      referencedFiles.add(image.uri);

      if (image.thumbnailUri) {
        referencedFiles.add(image.thumbnailUri);
      }
    }

    const storedFiles = await imageStorageService.listManagedImages();

    const allFiles = [
      ...storedFiles.originals,
      ...storedFiles.thumbnails,
    ];

    let deletedFiles = 0;
    let failedFiles = 0;

    for (const uri of allFiles) {
      if (referencedFiles.has(uri)) {
        continue;
      }

      try {
        await imageStorageService.deleteManagedImageFile(uri);
        deletedFiles++;
      } catch (error) {
        failedFiles++;
        console.warn(
          "Image cleanup failed:",
          uri,
          error
        );
      }
    }

    return {
      deletedFiles,
      failedFiles,
    };
  }
}

export const imageStorageCleanupService = new ImageStorageCleanupService();
