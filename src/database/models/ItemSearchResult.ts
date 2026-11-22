export type SearchMatchType =
  | "item"
  | "description"
  | "customField"
  | "tag"
  | "note";

export interface ItemSearchResult {
  itemId: string;
  itemName: string;
  collectionId: string;
  collectionName: string;
  favorite: boolean;
  updatedAt: string;
  matchedBy: SearchMatchType[];
}

export interface CollectionSearchResult {
  collectionId: string;
  collectionName: string;
  description: string | null;
  matchedBy: "name" | "description";
}

export interface GlobalSearchResults {
  items: ItemSearchResult[];
  collections: CollectionSearchResult[];
}