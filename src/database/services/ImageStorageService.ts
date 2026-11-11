
import { Directory, File, Paths } from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export interface StoredImage {
  uri: string;
  thumbnailUri: string;
}

class ImageStorageService {
  private readonly originalsDirectory = new Directory(
    Paths.document,
    "images",
    "originals"
  );

  private readonly thumbnailsDirectory = new Directory(
    Paths.document,
    "images",
    "thumbnails"
  );

  private ensureDirectories(): void {
    this.originalsDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    this.thumbnailsDirectory.create({
      idempotent: true,
      intermediates: true,
    });
  }

  async storeImage(sourceUri: string): Promise<StoredImage> {
    if (!sourceUri.trim()) {
      throw new Error("Image URI is required.");
    }

    this.ensureDirectories();

    const id = this.generateId();

    const extension = this.getExtension(sourceUri);

    const originalFile = new File(
      this.originalsDirectory,
      `${id}.${extension}`
    );

    const thumbnailFile = new File(
      this.thumbnailsDirectory,
      `${id}.jpg`
    );

    try {
      const sourceFile = new File(sourceUri);

      if (!sourceFile.exists) {
        throw new Error("Selected image file does not exist.");
      }

      sourceFile.copy(originalFile);

      const thumbnail = await ImageManipulator.manipulateAsync(
        originalFile.uri,
        [{ resize: { width: 400 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const generatedThumbnail = new File(thumbnail.uri);
      generatedThumbnail.copy(thumbnailFile);

      return {
        uri: originalFile.uri,
        thumbnailUri: thumbnailFile.uri,
      };
    } catch (error) {
      this.deleteFileIfExists(originalFile);
      this.deleteFileIfExists(thumbnailFile);

      throw error;
    }
  }

  
  async deleteImage(
    uri: string,
    thumbnailUri?: string | null
  ): Promise<void> {
    if (uri) {
      this.deleteManagedFile(uri, this.originalsDirectory);
    }

    if (thumbnailUri) {
      this.deleteManagedFile(
        thumbnailUri,
        this.thumbnailsDirectory
      );
    }
  }

  private deleteManagedFile(
    uri: string,
    directory: Directory
  ): void {
    const directoryUri = directory.uri.endsWith("/")
      ? directory.uri
      : `${directory.uri}/`;

    const isManagedFile =
      uri.startsWith(directoryUri) &&
      !uri.slice(directoryUri.length).includes("/") &&
      !uri.includes("..");

    if (!isManagedFile) {
      throw new Error(
        "Cannot delete a file outside Kura's image storage."
      );
    }

    this.deleteFileIfExists(new File(uri));
  }

  private deleteFileIfExists(file: File): void {
    if (file.exists) {
      file.delete();
    }
  }

  private getExtension(uri: string): string {
    const cleanUri = uri.split("?")[0];
    const extension = cleanUri.split(".").pop()?.toLowerCase();

    if (
      extension &&
      ["jpg", "jpeg", "png", "webp", "heic"].includes(extension)
    ) {
      return extension;
    }

    return "jpg";
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

export const imageStorageService = new ImageStorageService();
