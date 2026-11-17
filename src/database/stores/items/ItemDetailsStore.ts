import { create } from "zustand";

import { Item } from "../../models/Item";
import { CollectionField } from "../../models/CollectionField";
import { ItemValue } from "../../models/ItemValue";
import { HistoricalItemField } from "../../models/HistoricalItemField";

import { itemRepository } from "../../repositories/ItemRepository";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { itemValueRepository } from "../../repositories/ItemValueRepository";

interface ItemDetailsState {
  item: Item | null;
  fields: CollectionField[];
  values: ItemValue[];
  historicalFields: HistoricalItemField[];

  isLoading: boolean;
  error: string | null;

  loadDetails: (itemId: string) => Promise<void>;
  clearDetails: () => void;
}

export const useItemDetailsStore =
  create<ItemDetailsState>((set) => {
    let latestRequestId = 0;

    return {
      item: null,
      fields: [],
      values: [],
      historicalFields: [],

      isLoading: false,
      error: null,

      loadDetails: async (itemId) => {
        const requestId = ++latestRequestId;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const item = await itemRepository.getById(itemId);

          if (!item) {
            throw new Error("Item not found.");
          }

          const [
            fields,
            values,
            historicalFields,
          ] = await Promise.all([
            collectionFieldRepository.getByCollectionId(
              item.collectionId
            ),
            itemValueRepository.getByItemId(item.id),
            itemValueRepository.getHistoricalFieldsByItemId(
              item.id
            ),
          ]);

          // Ignore results from an outdated request.
          if (requestId !== latestRequestId) {
            return;
          }

          set({
            item,
            fields,
            values,
            historicalFields,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          if (requestId !== latestRequestId) {
            return;
          }

          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load item details.",
          });
        }
      },

      clearDetails: () => {
        latestRequestId += 1;

        set({
          item: null,
          fields: [],
          values: [],
          historicalFields: [],
          isLoading: false,
          error: null,
        });
      },
    };
  });
