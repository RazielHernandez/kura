import { Item } from "../../../models/Item";
import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemRepository } from "../../../repositories/ItemRepository";
import { itemTagRepository } from "../../../repositories/ItemTagRepository";
import { itemValueRepository } from "../../../repositories/ItemValueRepository";

import { updateItemUseCase } from "../../items/UpdateItemUseCase";
import { validateItemFieldsUseCase } from "../../items/ValidateItemFieldsUseCase";
import { validateItemTagsUseCase } from "../../items/ValidateItemTagsUseCase";

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
     * Get the existing item.
     *
     * We need its collectionId to validate
     * fields and tags.
     */
    const existing =
      await itemRepository.getById(
        input.itemId
      );

    if (!existing) {
      throw new Error("Item not found");
    }

    /*
     * Validate fields.
     *
     * Every supplied field must belong
     * to the item's collection.
     */
    if (input.values?.length) {
      await validateItemFieldsUseCase.execute({
        collectionId: existing.collectionId,
        fieldIds: input.values.map(
          value => value.fieldId
        ),
      });
    }

    /*
     * Validate tags.
     *
     * undefined = don't change tags
     * []        = remove all tags
     * [...]     = replace tags
     */
    if (input.tagIds !== undefined) {
      await validateItemTagsUseCase.execute({
        collectionId: existing.collectionId,
        tagIds: input.tagIds,
      });
    }

    /*
     * Start transaction only after all
     * relationship validation succeeds.
     */
    return databaseService.transaction(async () => {

      /*
       * Update basic item information.
       */
      const item =
        await updateItemUseCase.execute({
          id: input.itemId,
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
       *
       * undefined = don't change
       * []        = remove all
       * [...]     = replace
       */
      if (input.tagIds !== undefined) {
        await itemTagRepository.setTagsForItem(
          item.id,
          input.tagIds
        );
      }

      /*
       * Add notes
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
       * Add images
       */
      if (input.imagesToAdd?.length) {
        for (const image of input.imagesToAdd) {
          await itemImageRepository.create(
            item.id,
            image.uri,
            {
              thumbnailUri:
                image.thumbnailUri ?? null,
            }
          );
        }
      }

      /*
       * History
       */
      await itemHistoryRepository.create(
        item.id,
        "UPDATED",
        `Item "${item.name}" was updated`
      );

      return item;
    });
  }
}

export const updateItemWorkflow = new UpdateItemWorkflow();