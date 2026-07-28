import { BaseEntity } from "./BaseEntity";

export interface ItemNote extends BaseEntity{
    itemId: string;

    content: string;
}