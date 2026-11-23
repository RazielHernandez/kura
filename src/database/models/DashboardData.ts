import { ItemWithCollection } from "./Item";

export interface DashboardData {
  collectionCount: number;
  itemCount: number;
  recentItems: ItemWithCollection[];
  favoriteItems: ItemWithCollection[];
}