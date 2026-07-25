export interface Collection {
    id: string;

    name: string;

    icon?: string;

    color?: string;

    description?: string;

    sortOrder: number;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;
}