import { BaseEntity } from "./BaseEntity";

export interface ItemImage extends BaseEntity{
    itemId: string;

    uri: string;

    thumbnailUri?: string;

    sortOrder: number;
}