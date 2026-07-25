export interface ItemImage {
    id: string;

    itemId: string;

    uri: string;

    thumbnailUri?: string;

    sortOrder: number;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}