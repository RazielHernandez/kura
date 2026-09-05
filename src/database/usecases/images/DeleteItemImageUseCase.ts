import { itemImageRepository } from "../../repositories/ItemImageRepository";

export class DeleteItemImageUseCase {
  async execute(
    imageId: string
  ): Promise<void> {
    const id = imageId.trim();

    if (!id) {
      throw new Error("Image ID is required");
    }

    const image = await itemImageRepository.getById(id);

    if (!image) {
      throw new Error(`Image not found: ${id}`);
    }

    await itemImageRepository.softDelete(id);
  }
}

export const deleteItemImageUseCase =
  new DeleteItemImageUseCase();