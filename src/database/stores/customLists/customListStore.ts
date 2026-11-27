import { create } from "zustand";

import { CustomList } from "../../models/CustomList";

import {
  CreateCustomListInput,
  createCustomListUseCase,
} from "../../usecases/customLists/CreateCustomListUseCase";

import {
  UpdateCustomListInput,
  updateCustomListUseCase,
} from "../../usecases/customLists/UpdateCustomListUseCase";

import { getCustomListsUseCase } from "../../usecases/customLists/GetCustomListsUseCase";
import { deleteCustomListUseCase } from "../../usecases/customLists/DeleteCustomListUseCase";
import { restoreCustomListUseCase } from "../../usecases/customLists/RestoreCustomListUseCase";
import {
  permanentlyDeleteCustomListUseCase,
} from "../../usecases/customLists/PermanentlyDeleteCustomListUseCase";

interface CustomListStoreState {
  customLists: CustomList[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadCustomLists: () => Promise<void>;

  createCustomList: (
    input: CreateCustomListInput
  ) => Promise<CustomList>;

  updateCustomList: (
    input: UpdateCustomListInput
  ) => Promise<CustomList>;

  deleteCustomList: (id: string) => Promise<void>;
  permanentlyDeleteCustomList: (id: string) => Promise<void>;

  restoreCustomList: (id: string) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useCustomListStore = create<CustomListStoreState>(
  (set, get) => {
    let latestLoadRequestId = 0;
    let dataVersion = 0;
    let pendingMutations = 0;

    const beginMutation = () => {
      dataVersion += 1;
      pendingMutations += 1;

      set({
        isSaving: true,
        error: null,
      });
    };

    const commitMutation = () => {
      dataVersion += 1;
    };

    const finishMutation = () => {
      pendingMutations -= 1;

      set({
        isSaving: pendingMutations > 0,
      });
    };

    const reset = () => {
      latestLoadRequestId += 1;
      dataVersion += 1;

      set({
        customLists: [],
        isLoading: false,
        isSaving: pendingMutations > 0,
        error: null,
      });
    };

    return {
      customLists: [],
      isLoading: false,
      isSaving: false,
      error: null,

      loadCustomLists: async () => {
        const requestId = ++latestLoadRequestId;
        const versionAtStart = dataVersion;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const customLists =
            await getCustomListsUseCase.execute();

          if (
            requestId === latestLoadRequestId &&
            versionAtStart === dataVersion
          ) {
            set({ customLists });
          }
        } catch (error) {
          if (requestId === latestLoadRequestId) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load custom lists."
              ),
            });
          }

          throw error;
        } finally {
          if (requestId === latestLoadRequestId) {
            set({ isLoading: false });
          }
        }
      },

      createCustomList: async (input) => {
        beginMutation();

        try {
          const customList =
            await createCustomListUseCase.execute(input);

          commitMutation();

          set((state) => ({
            customLists: [
              ...state.customLists.filter(
                (list) => list.id !== customList.id
              ),
              customList,
            ],
          }));

          return customList;
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to create custom list."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      updateCustomList: async (input) => {
        beginMutation();

        try {
          const updated =
            await updateCustomListUseCase.execute(input);

          commitMutation();

          set((state) => ({
            customLists: state.customLists.map((list) =>
              list.id === updated.id ? updated : list
            ),
          }));

          return updated;
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to update custom list."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      deleteCustomList: async (id) => {
        beginMutation();

        try {
          await deleteCustomListUseCase.execute(id);

          commitMutation();

          set((state) => ({
            customLists: state.customLists.filter(
              (list) => list.id !== id
            ),
          }));
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete custom list."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      permanentlyDeleteCustomList: async (id) => {
        beginMutation();

        try {
          await permanentlyDeleteCustomListUseCase.execute(id);

          commitMutation();

          set((state) => ({
            customLists: state.customLists.filter(
              (list) => list.id !== id
            ),
          }));
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to permanently delete custom list."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      restoreCustomList: async (id) => {
        beginMutation();

        try {
          await restoreCustomListUseCase.execute(id);

          commitMutation();
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to restore custom list."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }

        // Refresh because the restored list was not in the active state.
        try {
          await get().loadCustomLists();
        } catch {
          // The store already records the refresh error.
        }
      },

      clearError: () => set({ error: null }),

      reset,
    };
  }
);
