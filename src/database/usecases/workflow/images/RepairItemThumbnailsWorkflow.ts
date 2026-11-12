import { File } from "expo-file-system";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { imageStorageService } from "../../../services/ImageStorageService";


export interface ThumbnailRepairResult {
  repaired: number;
  skipped: number;
  failed: number;
}

class RepairItemThumbnailsWorkflow {
  async execute(): Promise<ThumbnailRepairResult> {
    const images = await itemImageRepository.getAllIncludingDeleted();

    let repaired = 0;
    let skipped = 0;
    let failed = 0;

    for (const image of images) {
      // Ignore deleted image records.
      if (image.deletedAt !== null) {
        skipped++;
        continue;
      }

      try {
        const originalFile = new File(image.uri);

        // Original image is missing.
        if (!originalFile.exists) {
          skipped++;
          continue;
        }

        // Thumbnail already exists.
        if (image.thumbnailUri) {
          const thumbnailFile = new File(image.thumbnailUri);

          if (thumbnailFile.exists) {
            skipped++;
            continue;
          }
        }

        // Generate and store a replacement thumbnail.
        const thumbnailUri = await imageStorageService.regenerateThumbnail(image.uri);

        // Persist the new thumbnail URI.
        await itemImageRepository.updateThumbnailUri(
          image.id,
          thumbnailUri
        );

        repaired++;

        console.log("Thumbnail repaired:", image.id);
      } catch (error) {
        failed++;

        console.warn(
          "Thumbnail repair failed:",
          image.id,
          error
        );
      }
    }

    return {
      repaired,
      skipped,
      failed,
    };
  }
}

export const repairItemThumbnailsWorkflow = new RepairItemThumbnailsWorkflow();