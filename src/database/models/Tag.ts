export interface Tag {
    id: string;

    collectionId: string;

    name: string;

    color?: string;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}