import { create } from "zustand";

import { ItemImage } from "../../models/ItemImage";

import {
  getItemImagesWorkflow,
} from "../../usecases/workflow/images/GetItemImagesWorkflow";

import {
  deleteItemImageWorkflow,
} from "../../usecases/workflow/images/DeleteItemImageWorkflow";

import {
  reorderItemImagesWorkflow,
} from "../../usecases/workflow/images/ReorderItemImagesWorkflow";

import {
  updateItemWorkflow,
} from "../../usecases/workflow/items/UpdateItemWorkflow";

interface ItemImageState {
  images: ItemImage[];
  activeItemId: string | null;

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadImages: (itemId: string) => Promise<void>;

  addImages: (
    itemId: string,
    imageUris: string[]
  ) => Promise<boolean>;

  deleteImage: (imageId: string) => Promise<boolean>;

  reorderImages: (
    itemId: string,
    imageIds: string[]
  ) => Promise<boolean>;

  clearImages: () => void;
  clearError: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useItemImageStore = create<ItemImageState>(
  (set, get) => {
    let latestLoadRequestId = 0;
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

    const runMutation = async (
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
      images: [],
      activeItemId: null,

      isLoading: false,
      isSaving: false,
      error: null,

      loadImages: async (itemId) => {
        const requestId = ++latestLoadRequestId;

        set({
          activeItemId: itemId,
          isLoading: true,
          error: null,
        });

        try {
          const images =
            await getItemImagesWorkflow.execute(itemId);

          if (requestId !== latestLoadRequestId) {
            return;
          }

          set({
            images,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          if (requestId !== latestLoadRequestId) {
            return;
          }

          set({
            isLoading: false,
            error: getErrorMessage(
              error,
              "Unable to load item images."
            ),
          });
        }
      },

      addImages: (itemId, imageUris) =>
        runMutation(
          async () => {
            if (imageUris.length === 0) {
              return;
            }

            await updateItemWorkflow.execute({
              itemId,
              imagesToAdd: imageUris.map(uri => ({
                uri,
              })),
            });

            await get().loadImages(itemId);
          },
          "Unable to add item images."
        ),

      deleteImage: (imageId) =>
        runMutation(
          async () => {
            const image = get().images.find(
              item => item.id === imageId
            );

            if (!image) {
              throw new Error("Image not found.");
            }

            await deleteItemImageWorkflow.execute(imageId);

            await get().loadImages(image.itemId);
          },
          "Unable to delete item image."
        ),

      reorderImages: (itemId, imageIds) =>
        runMutation(
          async () => {
            await reorderItemImagesWorkflow.execute({
              itemId,
              imageIds,
            });

            await get().loadImages(itemId);
          },
          "Unable to reorder item images."
        ),

      clearImages: () => {
        latestLoadRequestId += 1;

        set({
          images: [],
          activeItemId: null,
          isLoading: false,
          isSaving: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    };
  }
);
