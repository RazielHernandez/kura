
import { create } from "zustand";

import { Tag } from "../../models/Tag";
import { getTagsByCollectionUseCase } from "../../usecases/tags/GetTagsByCollectionUseCase";
import { createTagWorkflow } from "../../usecases/workflow/tags/CreateTagWorkflow";
import { updateTagWorkflow } from "../../usecases/workflow/tags/UpdateTagWorkflow";
import { deleteTagWorkflow } from "../../usecases/workflow/tags/DeleteTagWorkflow";

interface TagState {
  tags: Tag[];

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadTags: (collectionId: string) => Promise<void>;

  createTag: (
    collectionId: string,
    name: string,
    color?: string | null
  ) => Promise<boolean>;

  updateTag: (
    id: string,
    name?: string,
    color?: string | null
  ) => Promise<boolean>;

  deleteTag: (id: string) => Promise<boolean>;

  clearTags: () => void;
  clearError: () => void;
}

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  return error instanceof Error ? error.message : fallback;
};

export const useTagStore = create<TagState>((set, get) => {
  let latestLoadRequestId = 0;
  let activeCollectionId: string | null = null;
  let pendingMutations = 0;

  const runMutation = async (
    action: () => Promise<void>,
    fallback: string
  ): Promise<boolean> => {
    pendingMutations++;

    set({
      isSaving: true,
      error: null,
    });

    try {
      await action();
      return true;
    } catch (error) {
      set({
        error: getErrorMessage(error, fallback),
      });

      return false;
    } finally {
      pendingMutations--;

      set({
        isSaving: pendingMutations > 0,
      });
    }
  };

  const refreshTagsIfActive = async (
    collectionId: string
  ): Promise<void> => {
    if (activeCollectionId === collectionId) {
      await get().loadTags(collectionId);
    }
  };

  return {
    tags: [],

    isLoading: false,
    isSaving: false,
    error: null,

    loadTags: async (collectionId) => {
      const requestId = ++latestLoadRequestId;

      const isDifferentCollection =
        activeCollectionId !== collectionId;

      activeCollectionId = collectionId;

      set({
        tags: isDifferentCollection ? [] : get().tags,
        isLoading: true,
        error: null,
      });

      try {
        const tags =
          await getTagsByCollectionUseCase.execute(collectionId);

        // Ignore outdated requests.
        if (requestId !== latestLoadRequestId) return;

        set({
          tags,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Only the latest request can update the store.
        if (requestId !== latestLoadRequestId) return;

        set({
          isLoading: false,
          error: getErrorMessage(error, "Unable to load tags."),
        });
      }
    },

    createTag: async (collectionId, name, color = null) => {
      return runMutation(async () => {
        await createTagWorkflow.execute({
          collectionId,
          name,
          color,
        });

        await refreshTagsIfActive(collectionId);
      }, "Unable to create tag.");
    },

    updateTag: async (id, name, color) => {
      return runMutation(async () => {
        const existing = get().tags.find((tag) => tag.id === id);

        if (!existing) {
          throw new Error("Tag not found.");
        }

        await updateTagWorkflow.execute({
          id,
          name,
          color,
        });

        await refreshTagsIfActive(existing.collectionId);
      }, "Unable to update tag.");
    },

    deleteTag: async (id) => {
      return runMutation(async () => {
        const existing = get().tags.find((tag) => tag.id === id);

        if (!existing) {
          throw new Error("Tag not found.");
        }

        await deleteTagWorkflow.execute(id);

        await refreshTagsIfActive(existing.collectionId);
      }, "Unable to delete tag.");
    },

    clearTags: () => {
      // Invalidate any outstanding load request.
      latestLoadRequestId++;
      activeCollectionId = null;

      set({
        tags: [],
        isLoading: false,
        isSaving: pendingMutations > 0,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
