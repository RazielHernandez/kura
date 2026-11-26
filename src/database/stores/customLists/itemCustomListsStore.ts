import { create } from "zustand";
import { getListsByItemUseCase } from "../../usecases/lists/GetListsByItemUseCase";
import { addItemToListUseCase } from "../../usecases/lists/AddItemToListUseCase";
import { removeItemFromListUseCase } from "../../usecases/lists/RemoveItemFromListUseCase";

interface ItemCustomListsState {
  listIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadListsForItem: (itemId: string) => Promise<void>;
  addToList: (listId: string, itemId: string) => Promise<void>;
  removeFromList: (listId: string, itemId: string) => Promise<void>;
  clear: () => void;
}

export const useItemCustomListsStore =
  create<ItemCustomListsState>((set) => ({
    listIds: [],
    isLoading: false,
    isSaving: false,
    error: null,

    loadListsForItem: async (itemId) => {
      set({ isLoading: true, error: null });

      try {
        const listIds =
          await getListsByItemUseCase.execute(itemId);

        set({ listIds, isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load item lists.",
          isLoading: false,
        });
      }
    },

    addToList: async (listId, itemId) => {
      set({ isSaving: true, error: null });

      try {
        await addItemToListUseCase.execute({
          listId,
          itemId,
        });

        set((state) => ({
          listIds: [...new Set([...state.listIds, listId])],
          isSaving: false,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to add item to list.",
          isSaving: false,
        });

        throw error;
      }
    },

    removeFromList: async (listId, itemId) => {
      set({ isSaving: true, error: null });

      try {
        await removeItemFromListUseCase.execute({
          listId,
          itemId,
        });

        set((state) => ({
          listIds: state.listIds.filter((id) => id !== listId),
          isSaving: false,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove item from list.",
          isSaving: false,
        });

        throw error;
      }
    },

    clear: () =>
      set({
        listIds: [],
        isLoading: false,
        isSaving: false,
        error: null,
      }),
  }));
