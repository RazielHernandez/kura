import { create } from "zustand";
import { createItemWorkflow, CreateItemWorkflowInput } from "../../usecases/workflow/items/CreateItemWorkflow";
import { Item } from "../../models/Item";
import {
  updateItemWorkflow,
  UpdateItemWorkflowInput,
} from "../../usecases/workflow/items/UpdateItemWorkflow";
import { deleteItemWorkflow } from "../../usecases/workflow/items/DeleteItemWorkflow";
import { restoreItemWorkflow } from "../../usecases/workflow/items/RestoreItemWorkflow";

interface ItemState {
  isSaving: boolean;
  error: string | null;

  createItem: (
    input: CreateItemWorkflowInput
  ) => Promise<Item | null>;

  updateItem: (
    input: UpdateItemWorkflowInput
  ) => Promise<Item | null>;

  deleteItem: (itemId: string) => Promise<boolean>;

  restoreItem: (itemId: string) => Promise<boolean>;

  clearError: () => void;
}

export const useItemStore = create<ItemState>((set) => ({
  isSaving: false,
  error: null,

  createItem: async (input) => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      const item = await createItemWorkflow.execute(input);

      set({
        isSaving: false,
        error: null,
      });

      return item;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create item.",
      });

      return null;
    }
  },

  updateItem: async (input) => {
    set({
      isSaving: true,
      error: null,
    });

    try {
      const item = await updateItemWorkflow.execute(input);

      set({
        isSaving: false,
        error: null,
      });

      return item;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update item.",
      });

      return null;
    }
  },

  deleteItem: async (itemId) => {
      set({ isSaving: true, error: null });

      try {
          await deleteItemWorkflow.execute(itemId);

          set({ isSaving: false });
          return true;
      } catch (error) {
          set({
              isSaving: false,
              error: error instanceof Error
                  ? error.message
                  : "Unable to delete item."
          });

          return false;
      }
  },

  restoreItem: async (itemId) => {
    set({ isSaving: true, error: null });

    try {
        await restoreItemWorkflow.execute(itemId);

        set({ isSaving: false });
        return true;
    } catch (error) {
        set({
            isSaving: false,
            error: error instanceof Error
                ? error.message
                : "Unable to restore item."
        });

        return false;
    }
  },

  clearError: () => set({ error: null }),
}));