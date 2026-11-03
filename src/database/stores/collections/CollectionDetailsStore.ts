import { create } from "zustand";
import { Collection } from "../../models/Collection";
import { CollectionField } from "../../models/CollectionField";
import { collectionRepository } from "../../repositories/CollectionRepository";
import { getCollectionFieldsUseCase } from "../../usecases/collectionFields/GetCollectionFieldsUseCase";
import { Item } from "../../models/Item";
import { itemRepository } from "../../repositories/ItemRepository";

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

      const [fields, items] = await Promise.all([
        getCollectionFieldsUseCase.execute(collectionId),
        itemRepository.getByCollectionId(collectionId),
      ]);

      set({
        isLoading: true,
        error: null,
        collection: null,
        fields: [],
        items: [],
      });

      try {
        const collection =
          await collectionRepository.getById(collectionId);

        if (!collection) {
          throw new Error("Collection not found");
        }

        const fields =
          await getCollectionFieldsUseCase.execute(collectionId);

        set({
          collection,
          fields,
          items,
          isLoading: false,
        });

      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load collection.",
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
