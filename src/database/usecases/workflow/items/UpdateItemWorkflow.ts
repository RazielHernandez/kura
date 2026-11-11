
import { Item } from "../../../models/Item";
import { databaseService } from "../../../DatabaseService";

import {
  imageStorageService,
  StoredImage,
} from "../../../services/ImageStorageService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemRepository } from "../../../repositories/ItemRepository";
import { itemTagRepository } from "../../../repositories/ItemTagRepository";
import { itemValueRepository } from "../../../repositories/ItemValueRepository";

import { updateItemUseCase } from "../../items/UpdateItemUseCase";
import { validateItemFieldsUseCase } from "../../items/ValidateItemFieldsUseCase";
import { validateItemTagsUseCase } from "../../items/ValidateItemTagsUseCase";
import { validateRequiredItemFieldsUseCase } from "../../items/ValidateRequiredItemFieldsUseCase";

export interface UpdateItemWorkflowInput {
  itemId: string;

  name?: string;
  description?: string | null;
  favorite?: boolean;

  values?: Array<{
    fieldId: string;
    value: string | null;
  }>;

  tagIds?: string[];

  notesToAdd?: string[];

  imagesToAdd?: Array<{
    uri: string;
    thumbnailUri?: string | null;
  }>;
}

export class UpdateItemWorkflow {
  async execute(
    input: UpdateItemWorkflowInput
  ): Promise<Item> {

    /*
     * Load existing values and merge supplied changes.
     */

    const currentValues =
      await itemValueRepository.getByItemId(input.itemId);

    const incomingValues = input.values ?? [];
    const fieldIds = incomingValues.map(value => value.fieldId);

    if (new Set(fieldIds).size !== fieldIds.length) {
      throw new Error(
        "An item cannot have multiple values for the same field"
      );
    }

    if (input.tagIds !== undefined) {
      if (new Set(input.tagIds).size !== input.tagIds.length) {
        throw new Error("Duplicate tag IDs are not allowed");
      }
    }

    const valuesByFieldId = new Map<string, string | null>(
      currentValues.map(value => [
        value.fieldId,
        value.value,
      ])
    );

    for (const value of incomingValues) {
      valuesByFieldId.set(value.fieldId, value.value);
    }

    const finalValues = Array.from(
      valuesByFieldId,
      ([fieldId, value]) => ({
        fieldId,
        value,
      })
    );

    /*
     * Store new images.
     */

    const storedImages: StoredImage[] = [];

    try {
      if (input.imagesToAdd?.length) {
        for (const image of input.imagesToAdd) {
          const storedImage =
            await imageStorageService.storeImage(image.uri);

          storedImages.push(storedImage);
        }
      }

      /*
       * Database transaction.
       */

      return await databaseService.transaction(async () => {

        const existing =
          await itemRepository.getById(input.itemId);

        if (!existing) {
          throw new Error("Item not found");
        }

        /*
         * Validate field ownership.
         */

        await validateItemFieldsUseCase.execute({
          collectionId: existing.collectionId,
          fieldIds: finalValues.map(value => value.fieldId),
        });

        /*
         * Validate required fields.
         */

        await validateRequiredItemFieldsUseCase.execute({
          collectionId: existing.collectionId,
          values: finalValues,
        });

        /*
         * Validate tags.
         */

        if (input.tagIds !== undefined) {
          await validateItemTagsUseCase.execute({
            collectionId: existing.collectionId,
            tagIds: input.tagIds,
          });
        }

        /*
         * Update basic item information.
         */

        const item = await updateItemUseCase.execute({
          id: input.itemId,
          name: input.name,
          description: input.description,
          favorite: input.favorite,
        });

        /*
         * Update supplied values only.
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
         * Update tags when provided.
         */

        if (input.tagIds !== undefined) {
          await itemTagRepository.setTagsForItem(
            item.id,
            input.tagIds
          );
        }

        /*
         * Add notes.
         */

        if (input.notesToAdd?.length) {
          for (const content of input.notesToAdd) {
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
         * Add images using permanent local URIs.
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
         * Record history.
         */

        await itemHistoryRepository.create(
          item.id,
          "UPDATED",
          `Item "${item.name}" was updated`
        );

        return item;
      });

    } catch (error) {

      /*
       * Clean up newly stored files if the operation fails.
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

export const updateItemWorkflow = new UpdateItemWorkflow();
