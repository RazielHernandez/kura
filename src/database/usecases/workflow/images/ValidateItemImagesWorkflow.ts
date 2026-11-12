
import { File } from "expo-file-system";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";

export interface ImageIntegrityResult {
  valid: number;
  missingOriginal: number;
  skipped: number;
  failed: number;
  missingImageIds: string[];
}

class ValidateItemImagesWorkflow {
  async execute(): Promise<ImageIntegrityResult> {
    const images = await itemImageRepository.getAllIncludingDeleted();

    let valid = 0;
    let missingOriginal = 0;
    let skipped = 0;
    let failed = 0;

    const missingImageIds: string[] = [];

    for (const image of images) {
      if (image.deletedAt !== null) {
        skipped++;
        continue;
      }

      try {
        const originalFile = new File(image.uri);

        if (!originalFile.exists) {
          missingOriginal++;
          missingImageIds.push(image.id);

          console.warn(
            "Original image is missing:",
            image.id,
            image.uri
          );

          continue;
        }

        valid++;
      } catch (error) {
        failed++;

        console.warn(
          "Image integrity validation failed:",
          image.id,
          error
        );
      }
    }

    return {
      valid,
      missingOriginal,
      skipped,
      failed,
      missingImageIds,
    };
  }
}

export const validateItemImagesWorkflow = new ValidateItemImagesWorkflow();
