import { create } from "zustand";

import { ItemHistory } from "../../models/ItemHistory";
import { getItemHistoryUseCase } from "../../usecases/history/GetItemHistoryUseCase";

interface ItemHistoryState {
  history: ItemHistory[];
  isLoading: boolean;
  error: string | null;

  loadHistory: (itemId: string) => Promise<void>;
  clearHistory: () => void;
}

export const useItemHistoryStore =
  create<ItemHistoryState>((set) => {
    let latestRequestId = 0;

    return {
      history: [],
      isLoading: false,
      error: null,

      loadHistory: async (itemId) => {
        const requestId = ++latestRequestId;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const history =
            await getItemHistoryUseCase.execute(itemId);

          if (requestId !== latestRequestId) {
            return;
          }

          set({
            history,
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
                : "Unable to load item history.",
          });
        }
      },

      clearHistory: () => {
        latestRequestId += 1;

        set({
          history: [],
          isLoading: false,
          error: null,
        });
      },
    };
  });
