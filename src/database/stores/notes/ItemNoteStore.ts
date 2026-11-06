import { create } from "zustand";
import { ItemNote } from "../../models/ItemNote";
import { getItemNotesUseCase } from "../../usecases/notes/GetItemNotesUseCase";
import { createItemNoteWorkflow } from "../../usecases/workflow/notes/CreateItemNoteWorkflow";
import { updateItemNoteWorkflow } from "../../usecases/workflow/notes/UpdateItemNoteWorkflow";
import { deleteItemNoteWorkflow } from "../../usecases/workflow/notes/DeleteItemNoteWorkflow";


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

export const useItemNoteStore =
  create<ItemNoteState>((set, get) => ({
    notes: [],

    isLoading: false,
    isSaving: false,
    error: null,

    /*
     * Load notes
     */
    loadNotes: async (itemId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const notes =
          await getItemNotesUseCase.execute(itemId);

        set({
          notes,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load item notes.",
        });
      }
    },

    /*
     * Create note
     */
    createNote: async (itemId, content) => {

        set({
            isSaving: true,
            error: null,
        });

        try {

            await createItemNoteWorkflow.execute({
            itemId,
            content,
            });

            await get().loadNotes(itemId);

            set({
            isSaving: false,
            error: null,
            });

            return true;
        } catch (error) {

            set({
            isSaving: false,
            error:
                error instanceof Error
                ? error.message
                : "Unable to create note.",
            });

            return false;
        }
        },

    /*
     * Update note
     */
    updateNote: async (noteId, content) => {
      set({
        isSaving: true,
        error: null,
      });

      try {
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

        set({
          isSaving: false,
          error: null,
        });

        return true;
      } catch (error) {
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to update note.",
        });

        return false;
      }
    },

    /*
     * Delete note
     */
    deleteNote: async (noteId) => {
      set({
        isSaving: true,
        error: null,
      });

      try {
        const note = get().notes.find(
          (item) => item.id === noteId
        );

        if (!note) {
          throw new Error("Note not found.");
        }

        await deleteItemNoteWorkflow.execute(noteId);

        await get().loadNotes(note.itemId);

        set({
          isSaving: false,
          error: null,
        });

        return true;
      } catch (error) {
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to delete note.",
        });

        return false;
      }
    },

    /*
     * Clear state
     */
    clearNotes: () =>
      set({
        notes: [],
        isLoading: false,
        isSaving: false,
        error: null,
      }),

    clearError: () => set({ error: null }),
  }));