import { create } from "zustand";

import { Collection } from "../../models/Collection";
import { createCollectionWorkflow, CreateCollectionWorkflowInput } from "../../usecases/workflow/collections/CreateCollectionWorkflow";
import { updateCollectionWorkflow, UpdateCollectionWorkflowInput } from "../../usecases/workflow/collections/UpdateCollectionWorkflow";
import { getCollectionsUseCase } from "../../usecases/collections/GetCollectionsUseCase";
import { deleteCollectionWorkflow } from "../../usecases/workflow/collections/DeleteCollectionWorkflow";
import { restoreCollectionWorkflow } from "../../usecases/workflow/collections/RestoreCollectionWorkflow";


interface CollectionStoreState {
  collections: Collection[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadCollections: () => Promise<void>;

  createCollection: (
    input: CreateCollectionWorkflowInput
  ) => Promise<Collection>;

  updateCollection: (
    input: UpdateCollectionWorkflowInput
  ) => Promise<Collection>;

  deleteCollection: (id: string) => Promise<void>;

  restoreCollection: (id: string) => Promise<void>;

  clearError: () => void;

  reset: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

function sortCollections(
  collections: Collection[]
): Collection[] {
  return [...collections].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.name.localeCompare(b.name)
  );
}

export const useCollectionStore = create<CollectionStoreState>(
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
      // Invalidate loads that started before this mutation
      // completed, including loads started during the mutation.
      dataVersion += 1;
    };

    const finishMutation = () => {
      pendingMutations -= 1;

      set({
        isSaving: pendingMutations > 0,
      });
    };

    const reset = () => {
      // Invalidate any collection load currently in progress.
      latestLoadRequestId += 1;
      dataVersion += 1;

      set({
        collections: [],
        isLoading: false,
        isSaving: pendingMutations > 0,
        error: null,
      });
    };

    return {
      collections: [],
      isLoading: false,
      isSaving: false,
      error: null,

      loadCollections: async () => {
        const requestId = ++latestLoadRequestId;
        const versionAtStart = dataVersion;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const collections =
            await getCollectionsUseCase.execute();

          if (
            requestId === latestLoadRequestId &&
            versionAtStart === dataVersion
          ) {
            set({
              collections: sortCollections(collections),
            });
          }
        } catch (error) {
          if (requestId === latestLoadRequestId) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load collections."
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

      createCollection: async (input) => {
        beginMutation();

        try {
          const collection =
            await createCollectionWorkflow.execute(input);

          commitMutation();

          set((state) => ({
            collections: sortCollections([
              ...state.collections.filter(
                (item) => item.id !== collection.id
              ),
              collection,
            ]),
          }));

          return collection;
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to create collection."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      updateCollection: async (input) => {
        beginMutation();

        try {
          const updated =
            await updateCollectionWorkflow.execute(input);

          commitMutation();

          set((state) => ({
            collections: sortCollections(
              state.collections.map((collection) =>
                collection.id === updated.id
                  ? updated
                  : collection
              )
            ),
          }));

          return updated;
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to update collection."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      deleteCollection: async (id) => {
        beginMutation();

        try {
          await deleteCollectionWorkflow.execute(id);

          commitMutation();

          set((state) => ({
            collections: state.collections.filter(
              (collection) => collection.id !== id
            ),
          }));
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete collection."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }
      },

      restoreCollection: async (id) => {
        beginMutation();

        try {
          await restoreCollectionWorkflow.execute(id);

          commitMutation();
        } catch (error) {
          set({
            error: getErrorMessage(
              error,
              "Failed to restore collection."
            ),
          });

          throw error;
        } finally {
          finishMutation();
        }

        // The restore succeeded. Refresh the active collection
        // list because the restored collection may have any sort order.
        try {
          await get().loadCollections();
        } catch {
          // The store already records the refresh error.
          // Do not report a successful restore as a failed restore.
        }
      },

      clearError: () => set({ error: null }),

      reset,
      
    };
  }
);
