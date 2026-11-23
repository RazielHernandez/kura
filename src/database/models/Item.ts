import { BaseEntity } from "./BaseEntity";

export interface Item extends BaseEntity{
    collectionId: string;
    name: string;
    description: string | null;
    favorite: boolean;
}

export interface ItemWithCollection extends Item {
  collectionName: string;
}

export interface ItemWithCollection extends Item {
  collectionName: string;
}

export interface ItemWithCollectionRow extends Omit<Item, "favorite"> {
  favorite: number;
  collectionName: string;
}