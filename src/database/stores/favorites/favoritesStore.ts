import { create } from "zustand";

import { ItemWithCollection } from "../../models/Item";
import { getFavoriteItemsUseCase } from "../../usecases/favorites/GetFavoriteItemsUseCase";

interface FavoritesState {
  items: ItemWithCollection[];
  isLoading: boolean;
  error: string | null;

  loadFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

export const useFavoritesStore = create<FavoritesState>((set) => {
  let latestRequestId = 0;

  return {
    items: [],
    isLoading: false,
    error: null,

    loadFavorites: async () => {
      const requestId = ++latestRequestId;

      set({
        isLoading: true,
        error: null,
      });

      try {
        const items = await getFavoriteItemsUseCase.execute();

        if (requestId !== latestRequestId) {
          return;
        }

        set({
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
            "Unable to load favorite items."
          ),
        });
      }
    },

    clearFavorites: () => {
      latestRequestId += 1;

      set({
        items: [],
        isLoading: false,
        error: null,
      });
    },
  };
});