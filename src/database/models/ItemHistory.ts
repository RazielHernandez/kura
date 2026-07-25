export type ItemHistoryType =
    | "CREATED"
    | "UPDATED"
    | "PURCHASED"
    | "SOLD"
    | "LENT"
    | "BORROWED"
    | "RESTORED"
    | "CUSTOM";

export interface ItemHistory {
    id: string;

    itemId: string;

    type: ItemHistoryType;

    description?: string;

    createdAt: string;
}