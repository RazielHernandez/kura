
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

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],

  isLoading: false,
  isSaving: false,
  error: null,

  loadTags: async (collectionId) => {
    set({ isLoading: true, error: null });

    try {
      const tags = await getTagsByCollectionUseCase.execute(
        collectionId
      );

      set({
        tags,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load tags.",
      });
    }
  },

  createTag: async (collectionId, name, color = null) => {
    set({ isSaving: true, error: null });

    try {
      await createTagWorkflow.execute({
        collectionId,
        name,
        color,
      });

      await get().loadTags(collectionId);

      set({ isSaving: false, error: null });

      return true;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create tag.",
      });

      return false;
    }
  },

  updateTag: async (id, name, color) => {
    set({ isSaving: true, error: null });

    try {
      const existing = get().tags.find((tag) => tag.id === id);

      if (!existing) {
        throw new Error("Tag not found.");
      }

      await updateTagWorkflow.execute({
        id,
        name,
        color,
      });

      await get().loadTags(existing.collectionId);

      set({ isSaving: false, error: null });

      return true;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update tag.",
      });

      return false;
    }
  },

  deleteTag: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const existing = get().tags.find((tag) => tag.id === id);

      if (!existing) {
        throw new Error("Tag not found.");
      }

      await deleteTagWorkflow.execute(id);

      await get().loadTags(existing.collectionId);

      set({ isSaving: false, error: null });

      return true;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete tag.",
      });

      return false;
    }
  },

  clearTags: () =>
    set({
      tags: [],
      isLoading: false,
      isSaving: false,
      error: null,
    }),

  clearError: () => set({ error: null }),
}));
