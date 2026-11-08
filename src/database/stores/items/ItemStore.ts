import { create } from "zustand";

import { Item } from "../../models/Item";

import {
  createItemWorkflow,
  CreateItemWorkflowInput,
} from "../../usecases/workflow/items/CreateItemWorkflow";

import {
  updateItemWorkflow,
  UpdateItemWorkflowInput,
} from "../../usecases/workflow/items/UpdateItemWorkflow";

import { deleteItemWorkflow } from "../../usecases/workflow/items/DeleteItemWorkflow";
import { restoreItemWorkflow } from "../../usecases/workflow/items/RestoreItemWorkflow";

import {
  purchaseItemWorkflow,
  PurchaseItemWorkflowInput,
} from "../../usecases/workflow/items/PurchaseItemWorkflow";

import {
  sellItemWorkflow,
  SellItemWorkflowInput,
} from "../../usecases/workflow/items/SellItemWorkflow";

import {
  lendItemWorkflow,
  LendItemWorkflowInput,
} from "../../usecases/workflow/items/LendItemWorkflow";

import {
  borrowItemWorkflow,
  BorrowItemWorkflowInput,
} from "../../usecases/workflow/items/BorrowItemWorkflow";

import {
  setItemTagsWorkflow,
  SetItemTagsWorkflowInput,
} from "../../usecases/workflow/tags/SetItemTagsWorkflow";

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

  purchaseItem: (
    input: PurchaseItemWorkflowInput
  ) => Promise<boolean>;

  sellItem: (
    input: SellItemWorkflowInput
  ) => Promise<boolean>;

  lendItem: (
    input: LendItemWorkflowInput
  ) => Promise<boolean>;

  borrowItem: (
    input: BorrowItemWorkflowInput
  ) => Promise<boolean>;

  setItemTags: (
    input: SetItemTagsWorkflowInput
  ) => Promise<boolean>;

  clearError: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useItemStore = create<ItemState>((set) => {
  let pendingMutations = 0;

  const beginMutation = () => {
    pendingMutations += 1;

    set({
      isSaving: true,
      error: null,
    });
  };

  const finishMutation = () => {
    pendingMutations = Math.max(0, pendingMutations - 1);

    set({
      isSaving: pendingMutations > 0,
    });
  };

  const runAction = async (
    action: () => Promise<void>,
    fallback: string
  ): Promise<boolean> => {
    beginMutation();

    try {
      await action();
      return true;
    } catch (error) {
      set({
        error: getErrorMessage(error, fallback),
      });

      return false;
    } finally {
      finishMutation();
    }
  };

  return {
    isSaving: false,
    error: null,

    createItem: async (input) => {
      beginMutation();

      try {
        return await createItemWorkflow.execute(input);
      } catch (error) {
        set({
          error: getErrorMessage(
            error,
            "Unable to create item."
          ),
        });

        return null;
      } finally {
        finishMutation();
      }
    },

    updateItem: async (input) => {
      beginMutation();

      try {
        return await updateItemWorkflow.execute(input);
      } catch (error) {
        set({
          error: getErrorMessage(
            error,
            "Unable to update item."
          ),
        });

        return null;
      } finally {
        finishMutation();
      }
    },

    deleteItem: (itemId) =>
      runAction(
        () => deleteItemWorkflow.execute(itemId),
        "Unable to delete item."
      ),

    restoreItem: (itemId) =>
      runAction(
        () => restoreItemWorkflow.execute(itemId),
        "Unable to restore item."
      ),

    purchaseItem: (input) =>
      runAction(
        () => purchaseItemWorkflow.execute(input),
        "Unable to record item purchase."
      ),

    sellItem: (input) =>
      runAction(
        () => sellItemWorkflow.execute(input),
        "Unable to record item sale."
      ),

    lendItem: (input) =>
      runAction(
        () => lendItemWorkflow.execute(input),
        "Unable to record item loan."
      ),

    borrowItem: (input) =>
      runAction(
        () => borrowItemWorkflow.execute(input),
        "Unable to record borrowed item."
      ),

    setItemTags: (input) =>
      runAction(
        () => setItemTagsWorkflow.execute(input),
        "Unable to update item tags."
      ),

    clearError: () => set({ error: null }),
  };
});
