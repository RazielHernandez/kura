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

export interface CollectionField {
    id: string;

    collectionId: string;

    name: string;

    fieldType: FieldType;

    required: boolean;

    sortOrder: number;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}