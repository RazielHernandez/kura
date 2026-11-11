
import { Item } from "../../../models/Item";
import { databaseService } from "../../../DatabaseService";

import { imageStorageService, StoredImage } from "../../../services/ImageStorageService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemTagRepository } from "../../../repositories/ItemTagRepository";
import { itemValueRepository } from "../../../repositories/ItemValueRepository";

import { createItemUseCase } from "../../items/CreateItemUseCase";
import { validateItemFieldsUseCase } from "../../items/ValidateItemFieldsUseCase";
import { validateItemTagsUseCase } from "../../items/ValidateItemTagsUseCase";
import { validateRequiredItemFieldsUseCase } from "../../items/ValidateRequiredItemFieldsUseCase";

export interface CreateItemWorkflowInput {
  collectionId: string;
  name: string;
  description?: string | null;
  favorite?: boolean;

  values?: Array<{
    fieldId: string;
    value: string | null;
  }>;

  tagIds?: string[];

  notes?: string[];

  images?: Array<{
    uri: string;
    thumbnailUri?: string | null;
  }>;
}

export class CreateItemWorkflow {
  async execute(
    input: CreateItemWorkflowInput
  ): Promise<Item> {

    /*
     * Validate fields.
     */

    const values = input.values ?? [];
    const fieldIds = values.map(value => value.fieldId);

    if (new Set(fieldIds).size !== fieldIds.length) {
      throw new Error(
        "An item cannot have multiple values for the same field"
      );
    }

    await validateItemFieldsUseCase.execute({
      collectionId: input.collectionId,
      fieldIds,
    });

    await validateRequiredItemFieldsUseCase.execute({
      collectionId: input.collectionId,
      values,
    });

    /*
     * Validate tags.
     */

    if (input.tagIds) {
      if (new Set(input.tagIds).size !== input.tagIds.length) {
        throw new Error("Duplicate tag IDs are not allowed");
      }

      if (input.tagIds.length > 0) {
        await validateItemTagsUseCase.execute({
          collectionId: input.collectionId,
          tagIds: input.tagIds,
        });
      }
    }

    /*
     * Store images before starting the database transaction.
     *
     * These are permanent local file URIs, not gallery URIs.
     */

    const storedImages: StoredImage[] = [];

    try {
      if (input.images?.length) {
        for (const image of input.images) {
          const storedImage =
            await imageStorageService.storeImage(image.uri);

          storedImages.push(storedImage);
        }
      }

      /*
       * Database transaction.
       */

      return await databaseService.transaction(async () => {

        const item = await createItemUseCase.execute({
          collectionId: input.collectionId,
          name: input.name,
          description: input.description,
          favorite: input.favorite,
        });

        /*
         * Values
         */

        if (input.values?.length) {
          for (const value of input.values) {
            await itemValueRepository.setValue(
              item.id,
              value.fieldId,
              value.value
            );
          }
        }

        /*
         * Tags
         */

        if (input.tagIds?.length) {
          await itemTagRepository.setTagsForItem(
            item.id,
            input.tagIds
          );
        }

        /*
         * Notes
         */

        if (input.notes?.length) {
          for (const content of input.notes) {
            const trimmedContent = content.trim();

            if (!trimmedContent) {
              continue;
            }

            await itemNoteRepository.create(
              item.id,
              trimmedContent
            );
          }
        }

        /*
         * Images
         */

        for (const image of storedImages) {
          await itemImageRepository.create(
            item.id,
            image.uri,
            {
              thumbnailUri: image.thumbnailUri,
            }
          );
        }

        /*
         * History
         */

        await itemHistoryRepository.create(
          item.id,
          "CREATED",
          `Item "${item.name}" was created`
        );

        return item;
      });

    } catch (error) {

      /*
       * If storage or the database transaction fails,
       * remove any files created during this operation.
       */

      await Promise.allSettled(
        storedImages.map(image =>
          imageStorageService.deleteImage(
            image.uri,
            image.thumbnailUri
          )
        )
      );

      throw error;
    }
  }
}

export const createItemWorkflow = new CreateItemWorkflow();
