import { Item } from "../../../models/Item";
import { databaseService } from "../../../DatabaseService";

import { itemHistoryRepository } from "../../../repositories/ItemHistoryRepository";
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { itemNoteRepository } from "../../../repositories/ItemNoteRepository";
import { itemTagRepository } from "../../../repositories/ItemTagRepository";
import { itemValueRepository } from "../../../repositories/ItemValueRepository";

import { createItemUseCase } from "../../items/CreateItemUseCase";
import { validateItemFieldsUseCase } from "../../items/ValidateItemFieldsUseCase";
import { validateItemTagsUseCase } from "../../items/ValidateItemTagsUseCase";

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
     *
     * Every field must exist and belong
     * to the item collection.
     */
    if (input.values?.length) {
      await validateItemFieldsUseCase.execute({
        collectionId: input.collectionId,
        fieldIds: input.values.map(
          value => value.fieldId
        ),
      });
    }

    /*
     * Validate tags.
     *
     * Every tag must belong to the item collection.
     */
    if (input.tagIds?.length) {
      await validateItemTagsUseCase.execute({
        collectionId: input.collectionId,
        tagIds: input.tagIds,
      });
    }

    /*
     * Start transaction only after validation
     * has succeeded.
     */
    return databaseService.transaction(async () => {

      const item =
        await createItemUseCase.execute({
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
      if (input.images?.length) {
        for (const image of input.images) {
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
        "CREATED",
        `Item "${item.name}" was created`
      );

      return item;
    });
  }
}

export const createItemWorkflow = new CreateItemWorkflow();