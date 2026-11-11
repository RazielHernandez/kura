
import { itemImageRepository } from "../../../repositories/ItemImageRepository";
import { deleteItemImageUseCase } from "../../images/DeleteItemImageUseCase";
import { imageStorageService } from "../../../services/ImageStorageService";

export class DeleteItemImageWorkflow {
  async execute(imageId: string): Promise<void> {
    const id = imageId.trim();

    if (!id) {
      throw new Error("Image ID is required.");
    }

    // Retrieve image information before deletion.
    const image = await itemImageRepository.getById(id);

    if (!image) {
      throw new Error(`Image not found: ${id}`);
    }

    // Soft-delete the database record.
    await deleteItemImageUseCase.execute(id);

    // Remove the original image and thumbnail.
    await imageStorageService.deleteImage(
      image.uri,
      image.thumbnailUri
    );
  }
}

export const deleteItemImageWorkflow = new DeleteItemImageWorkflow();
