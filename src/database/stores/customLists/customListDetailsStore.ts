
import { create } from "zustand";

import { CustomList } from "../../models/CustomList";
import { ItemWithCollection } from "../../models/Item";

import { getCustomListUseCase } from "../../usecases/customLists/GetCustomListUseCase";
import { getItemsByListUseCase } from "../../usecases/lists/GetItemsByListUseCase";
import { addItemToListUseCase } from "../../usecases/lists/AddItemToListUseCase";
import { removeItemFromListUseCase } from "../../usecases/lists/RemoveItemFromListUseCase";
import { deleteCustomListUseCase } from "../../usecases/customLists/DeleteCustomListUseCase";

interface CustomListDetailsState {
  customList: CustomList | null;
  items: ItemWithCollection[];

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadDetails: (listId: string) => Promise<void>;

  addItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  clearDetails: () => void;

  deleteList: () => Promise<void>;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useCustomListDetailsStore =
  create<CustomListDetailsState>((set, get) => {
    let latestRequestId = 0;
    let currentListId: string | null = null;

    return {
      customList: null,
      items: [],

      isLoading: false,
      isSaving: false,
      error: null,

      loadDetails: async (listId) => {
        const requestId = ++latestRequestId;

        currentListId = listId;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const [customList, items] = await Promise.all([
            getCustomListUseCase.execute(listId),
            getItemsByListUseCase.execute(listId),
          ]);

          if (requestId !== latestRequestId) {
            return;
          }

          set({
            customList,
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
            error: getErrorMessage(
              error,
              "Unable to load custom list details."
            ),
          });
        }
      },

      addItem: async (itemId) => {
        const listId = currentListId;

        if (!listId) {
          throw new Error("No custom list is currently selected.");
        }

        set({
          isSaving: true,
          error: null,
        });

        try {
          await addItemToListUseCase.execute({
            listId,
            itemId,
          });

          const items =
            await getItemsByListUseCase.execute(listId);

          if (currentListId === listId) {
            set({ items });
          }
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Unable to add item to custom list."
            ),
          });

          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      removeItem: async (itemId) => {
        const listId = currentListId;

        if (!listId) {
          throw new Error("No custom list is currently selected.");
        }

        set({
          isSaving: true,
          error: null,
        });

        try {
          await removeItemFromListUseCase.execute({
            listId,
            itemId,
          });

          if (currentListId === listId) {
            set((state) => ({
              items: state.items.filter(
                (item) => item.id !== itemId
              ),
            }));
          }
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Unable to remove item from custom list."
            ),
          });

          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      clearDetails: () => {
        latestRequestId += 1;
        currentListId = null;

        set({
          customList: null,
          items: [],
          isLoading: false,
          isSaving: false,
          error: null,
        });
      },

      deleteList: async () => {
        const listId = currentListId;

        if (!listId) {
          throw new Error("No custom list is currently selected.");
        }

        set({
          isSaving: true,
          error: null,
        });

        try {
          await deleteCustomListUseCase.execute(listId);

          if (currentListId === listId) {
            set({
              customList: null,
              items: [],
            });
          }
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Unable to delete custom list."
            ),
          });

          throw error;
        } finally {
          set({ isSaving: false });
        }
      },
    };
  });
