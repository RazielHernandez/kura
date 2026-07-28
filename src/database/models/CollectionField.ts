import { BaseEntity } from "./BaseEntity";

export type FieldType =
    | "TEXT"
    | "NUMBER"
    | "DECIMAL"
    | "BOOLEAN"
    | "DATE"
    | "DATETIME"
    | "EMAIL"
    | "PHONE"
    | "URL"
    | "COLOR"
    | "RATING";

export interface CollectionField extends BaseEntity{

    collectionId: string;

    name: string;

    fieldType: FieldType;

    required: boolean;

    sortOrder: number;
}