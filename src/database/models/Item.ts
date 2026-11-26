import { BaseEntity } from "./BaseEntity";

export interface Item extends BaseEntity {
  collectionId: string;
  name: string;
  description: string | null;
  favorite: boolean;
}

export interface ItemWithCollection extends Item {
  collectionName: string;
  collectionIcon: string | null;
  collectionColor: string | null;
}
