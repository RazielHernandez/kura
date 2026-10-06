export type ItemHistoryType =
  | "CREATED"
  | "UPDATED"
  | "PURCHASED"
  | "SOLD"
  | "LENT"
  | "BORROWED"
  | "RESTORED"
  | "DELETED"
  | "CUSTOM";

export interface ItemHistory {
    id: string;

    itemId: string;

    type: ItemHistoryType;

    description: string | null;

    createdAt: string;
}