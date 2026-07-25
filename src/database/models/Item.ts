export interface Item {
    id: string;

    collectionId: string;

    name: string;

    description?: string;

    favorite: boolean;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}