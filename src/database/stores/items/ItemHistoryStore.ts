
import { create } from "zustand";
import { getItemHistoryUseCase } from "../../usecases/history/GetItemHistoryUseCase";
import { ItemHistory } from "../../models/ItemHistory";

interface ItemHistoryState {
  history: ItemHistory[];
  isLoading: boolean;
  error: string | null;

  loadHistory: (itemId: string) => Promise<void>;
  clearHistory: () => void;
}

export const useItemHistoryStore =
  create<ItemHistoryState>((set) => ({
    history: [],
    isLoading: false,
    error: null,

    loadHistory: async (itemId) => {
      set({
        isLoading: true,
        error: null,
        history: [],
      });

      try {
        const history =
          await getItemHistoryUseCase.execute(itemId);

        set({
          history,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load item history.",
        });
      }
    },

    clearHistory: () =>
      set({
        history: [],
        isLoading: false,
        error: null,
      }),
  }));
