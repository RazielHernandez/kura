
import { create } from "zustand";

import { Item } from "../../models/Item";
import { CollectionField } from "../../models/CollectionField";
import { ItemValue } from "../../models/ItemValue";
import { itemRepository } from "../../repositories/ItemRepository";
import { collectionFieldRepository } from "../../repositories/CollectionFieldRepository";
import { itemValueRepository } from "../../repositories/ItemValueRepository";

interface ItemDetailsState {
  item: Item | null;
  fields: CollectionField[];
  values: ItemValue[];

  isLoading: boolean;
  error: string | null;

  loadDetails: (itemId: string) => Promise<void>;
  clearDetails: () => void;
}

export const useItemDetailsStore =
  create<ItemDetailsState>((set) => ({
    item: null,
    fields: [],
    values: [],

    isLoading: false,
    error: null,

    loadDetails: async (itemId) => {
      set({
        isLoading: true,
        error: null,
        item: null,
        fields: [],
        values: [],
      });

      try {
        const item = await itemRepository.getById(itemId);

        if (!item) {
          throw new Error("Item not found");
        }

        const [fields, values] = await Promise.all([
          collectionFieldRepository.getByCollectionId(
            item.collectionId
          ),
          itemValueRepository.getByItemId(item.id),
        ]);

        set({
          item,
          fields,
          values,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load item.",
        });
      }
    },

    clearDetails: () =>
      set({
        item: null,
        fields: [],
        values: [],
        isLoading: false,
        error: null,
      }),
  }));
