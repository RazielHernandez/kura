import { ItemImage } from "../../../models/ItemImage";

import { getItemImagesUseCase } from "../../images/GetItemImagesUseCase";

export class GetItemImagesWorkflow {
  async execute(itemId: string): Promise<ItemImage[]> {
    return getItemImagesUseCase.execute(itemId);
  }
}

export const getItemImagesWorkflow =
  new GetItemImagesWorkflow();
