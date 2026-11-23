import { collectionRepository } from "../../repositories/CollectionRepository";
import { itemRepository } from "../../repositories/ItemRepository";
import { DashboardData } from "../../models/DashboardData";

export class GetDashboardDataUseCase {
  async execute(): Promise<DashboardData> {
    const [
      collectionCount,
      itemCount,
      recentItems,
      favoriteItems,
    ] = await Promise.all([
      collectionRepository.count(),
      itemRepository.count(),
      itemRepository.getRecentItems(5),
      itemRepository.getFavoriteItems(5),
    ]);

    return {
      collectionCount,
      itemCount,
      recentItems,
      favoriteItems,
    };
  }
}

export const getDashboardDataUseCase = new GetDashboardDataUseCase();