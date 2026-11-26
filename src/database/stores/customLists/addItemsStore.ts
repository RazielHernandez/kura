import { create } from "zustand";
import { ItemWithCollection } from "../../models/Item";
import { getAllItemsWithCollectionUseCase } from "../../usecases/items/GetAllItemsWithCollectionUseCase";
import { addItemToListUseCase } from "../../usecases/lists/AddItemToListUseCase";
import { getItemsByListUseCase } from "../../usecases/lists/GetItemsByListUseCase";

interface AddItemsState {
  items: ItemWithCollection[];
  existingItemIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadItems: (listId: string) => Promise<void>;
  addItems: (listId: string, itemIds: string[]) => Promise<void>;
  clearItems: () => void;
}

export const useAddItemsStore = create<AddItemsState>((set) => ({
  items: [],
  existingItemIds: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadItems: async (listId) => {
    set({ isLoading: true, error: null });

    try {
      const [items, existingItems] = await Promise.all([
        getAllItemsWithCollectionUseCase.execute(),
        getItemsByListUseCase.execute(listId),
      ]);

      set({
        items,
        existingItemIds: existingItems.map((item) => item.id),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load items.",
        isLoading: false,
      });
    }
  },

  addItems: async (listId, itemIds) => {
    set({ isSaving: true, error: null });

    try {
      for (const itemId of itemIds) {
        await addItemToListUseCase.execute({ listId, itemId });
      }

      set((state) => ({
        existingItemIds: [
          ...new Set([...state.existingItemIds, ...itemIds]),
        ],
        isSaving: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to add items.",
        isSaving: false,
      });

      throw error;
    }
  },

  clearItems: () => {
    set({
      items: [],
      existingItemIds: [],
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },
}));
