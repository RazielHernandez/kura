
import { GlobalSearchResults } from "../../models/ItemSearchResult";
import { searchRepository } from "../../repositories/SearchRepository";

export class GlobalSearchUseCase {
  async execute(query: string): Promise<GlobalSearchResults> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        items: [],
        collections: [],
      };
    }

    const [items, collections] = await Promise.all([
      searchRepository.searchItems(normalizedQuery),
      searchRepository.searchCollections(normalizedQuery),
    ]);

    return {
      items,
      collections,
    };
  }
}

export const globalSearchUseCase = new GlobalSearchUseCase();