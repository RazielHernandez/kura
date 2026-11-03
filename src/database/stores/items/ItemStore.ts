import { create } from "zustand";
import { createItemWorkflow, CreateItemWorkflowInput } from "../../usecases/workflow/items/CreateItemWorkflow";
import { Item } from "../../models/Item";

interface ItemState {
  isSaving: boolean;
  error: string | null;

  createItem: (
    input: CreateItemWorkflowInput
  ) => Promise<Item | null>;

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

  clearError: () => set({ error: null }),
}));