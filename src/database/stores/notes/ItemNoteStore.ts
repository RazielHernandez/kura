
import { create } from "zustand";

import { ItemNote } from "../../models/ItemNote";

import { getItemNotesUseCase } from "../../usecases/notes/GetItemNotesUseCase";

import {
  createItemNoteWorkflow,
} from "../../usecases/workflow/notes/CreateItemNoteWorkflow";

import {
  updateItemNoteWorkflow,
} from "../../usecases/workflow/notes/UpdateItemNoteWorkflow";

import {
  deleteItemNoteWorkflow,
} from "../../usecases/workflow/notes/DeleteItemNoteWorkflow";

interface ItemNoteState {
  notes: ItemNote[];

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadNotes: (itemId: string) => Promise<void>;

  createNote: (
    itemId: string,
    content: string
  ) => Promise<boolean>;

  updateNote: (
    noteId: string,
    content: string
  ) => Promise<boolean>;

  deleteNote: (noteId: string) => Promise<boolean>;

  clearNotes: () => void;
  clearError: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useItemNoteStore = create<ItemNoteState>(
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
      notes: [],

      isLoading: false,
      isSaving: false,
      error: null,

      loadNotes: async (itemId) => {
        const requestId = ++latestLoadRequestId;

        set({
          isLoading: true,
          error: null,
        });

        try {
          const notes =
            await getItemNotesUseCase.execute(itemId);

          if (requestId !== latestLoadRequestId) {
            return;
          }

          set({
            notes,
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
              "Unable to load item notes."
            ),
          });
        }
      },

      createNote: (itemId, content) =>
        runMutation(
          async () => {
            await createItemNoteWorkflow.execute({
              itemId,
              content,
            });

            await get().loadNotes(itemId);
          },
          "Unable to create note."
        ),

      updateNote: (noteId, content) =>
        runMutation(
          async () => {
            const note = get().notes.find(
              (item) => item.id === noteId
            );

            if (!note) {
              throw new Error("Note not found.");
            }

            await updateItemNoteWorkflow.execute({
              noteId,
              content,
            });

            await get().loadNotes(note.itemId);
          },
          "Unable to update note."
        ),

      deleteNote: (noteId) =>
        runMutation(
          async () => {
            const note = get().notes.find(
              (item) => item.id === noteId
            );

            if (!note) {
              throw new Error("Note not found.");
            }

            await deleteItemNoteWorkflow.execute(noteId);

            await get().loadNotes(note.itemId);
          },
          "Unable to delete note."
        ),

      clearNotes: () => {
        latestLoadRequestId += 1;

        set({
          notes: [],
          isLoading: false,
          isSaving: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    };
  }
);