
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
     * Get the existing item.
     */
    const existing =
      await itemRepository.getById(input.itemId);

    if (!existing) {
      throw new Error("Item not found");
    }

    /*
     * Load existing values and merge supplied changes.
     *
     * Values not included in input.values remain unchanged.
     * A supplied null or empty string replaces the old value.
     */
    const currentValues =
      await itemValueRepository.getByItemId(input.itemId);

    const valuesByFieldId = new Map<
      string,
      string | null
    >(
      currentValues.map(value => [
        value.fieldId,
        value.value,
      ])
    );

    for (const value of input.values ?? []) {
      valuesByFieldId.set(
        value.fieldId,
        value.value
      );
    }

    const finalValues = Array.from(
      valuesByFieldId,
      ([fieldId, value]) => ({
        fieldId,
        value,
      })
    );

    /*
     * Validate field ownership.
     *
     * Validate all fields in the final state, including
     * existing values that are not being changed.
     */
    await validateItemFieldsUseCase.execute({
      collectionId: existing.collectionId,
      fieldIds: finalValues.map(
        value => value.fieldId
      ),
    });

    /*
     * Validate required fields against the final state.
     */
    await validateRequiredItemFieldsUseCase.execute({
      collectionId: existing.collectionId,
      values: finalValues,
    });

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
     * Start transaction after validation succeeds.
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
       * Add images.
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
       * Record history.
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

export const updateItemWorkflow =
  new UpdateItemWorkflow();