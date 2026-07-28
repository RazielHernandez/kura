import { BaseEntity } from "./BaseEntity";

export interface ItemValue extends BaseEntity{

    itemId: string;

    fieldId: string;

    value?: string;
}