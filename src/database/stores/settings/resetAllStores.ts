import { useCollectionStore } from "../collections/collectionStore";
import { useItemStore } from "../items/ItemStore";
import { useItemDetailsStore } from "../items/ItemDetailsStore";
import { useItemHistoryStore } from "../items/ItemHistoryStore";
import { useItemImageStore } from "../images/ItemImageStore";
import { useItemNoteStore } from "../notes/ItemNoteStore";
import { useTagStore } from "../tags/TagStore";
import { useCollectionDetailsStore } from "../collections/CollectionDetailsStore";


export function resetAllStores(): void {
  useCollectionStore.getState().reset();
  useCollectionDetailsStore.getState().clearDetails();
  useItemStore.getState().clearError();
  useItemDetailsStore.getState().clearDetails();
  useItemHistoryStore.getState().clearHistory();
  useItemImageStore.getState().clearImages();
  useItemNoteStore.getState().clearNotes();
  useTagStore.getState().clearTags();
}