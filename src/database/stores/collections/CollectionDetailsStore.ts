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
  create<CollectionDetailsState>((set) => {
    let latestRequestId = 0;

    return {
      collection: null,
      fields: [],
      items: [],

      isLoading: false,
      error: null,

      loadDetails: async (collectionId) => {
        const requestId = ++latestRequestId;

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

          if (requestId !== latestRequestId) {
            return;
          }

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
          if (requestId !== latestRequestId) {
            return;
          }

          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load collection details.",
          });
        }
      },

      clearDetails: () => {
        // Invalidate pending requests.
        latestRequestId += 1;

        set({
          collection: null,
          fields: [],
          items: [],
          isLoading: false,
          error: null,
        });
      },
    };
  });