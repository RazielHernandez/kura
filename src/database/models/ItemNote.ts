export interface ItemNote {
    id: string;

    itemId: string;

    content: string;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}