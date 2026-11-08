import { create } from "zustand";

import { Collection } from "../../models/Collection";
import { CollectionField } from "../../models/CollectionField";
import { Item } from "../../models/Item";

import { collectionRepository } from "../../repositories/CollectionRepository";
import { itemRepository } from "../../repositories/ItemRepository";
import { getCollectionFieldsUseCase } from "../../usecases/collectionFields/GetCollectionFieldsUseCase";

interface CollectionDetailsState {
  collection: Collection | null;
  fields: CollectionField[];
  items: Item[];

  isLoading: boolean;
  error: string | null;

  loadDetails: (collectionId: string) => Promise<void>;
  clearDetails: () => void;
}

export const useCollectionDetailsStore =
  create<CollectionDetailsState>((set) => ({
    collection: null,
    fields: [],
    items: [],

    isLoading: false,
    error: null,

    loadDetails: async (collectionId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const [collection, fields, items] = await Promise.all([
          collectionRepository.getById(collectionId),
          getCollectionFieldsUseCase.execute(collectionId),
          itemRepository.getByCollectionId(collectionId),
        ]);

        if (!collection) {
          throw new Error("Collection not found.");
        }

        set({
          collection,
          fields,
          items,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load collection details.",
        });
      }
    },

    clearDetails: () =>
      set({
        collection: null,
        fields: [],
        items: [],
        isLoading: false,
        error: null,
      }),
  }));
