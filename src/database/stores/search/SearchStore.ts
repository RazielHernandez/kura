
import { create } from "zustand";

import { globalSearchUseCase } from "../../usecases/search/GlobalSearchUseCase";
import { GlobalSearchResults } from "../../models/ItemSearchResult";

interface SearchState {
  query: string;
  results: GlobalSearchResults;
  isLoading: boolean;
  error: string | null;

  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const emptyResults: GlobalSearchResults = {
  items: [],
  collections: [],
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useSearchStore = create<SearchState>((set) => {
  let latestRequestId = 0;

  return {
    query: "",
    results: emptyResults,
    isLoading: false,
    error: null,

    setQuery: (query) => {
      latestRequestId += 1;

      set({
        query,
        results: emptyResults,
        isLoading: false,
        error: null,
      });
    },

    search: async (query) => {
      const normalizedQuery = query.trim();
      const requestId = ++latestRequestId;

      if (!normalizedQuery) {
        set({
          query,
          results: emptyResults,
          isLoading: false,
          error: null,
        });

        return;
      }

      set({
        query,
        isLoading: true,
        error: null,
      });

      try {
        const results =
          await globalSearchUseCase.execute(normalizedQuery);

        if (requestId !== latestRequestId) {
          return;
        }

        set({
          results,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (requestId !== latestRequestId) {
          return;
        }

        set({
          results: emptyResults,
          isLoading: false,
          error: getErrorMessage(
            error,
            "Unable to perform search."
          ),
        });
      }
    },

    clearSearch: () => {
      latestRequestId += 1;

      set({
        query: "",
        results: emptyResults,
        isLoading: false,
        error: null,
      });
    },
  };
});
