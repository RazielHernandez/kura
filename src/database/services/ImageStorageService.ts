
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

    let generatedThumbnail: File | null = null;

    try {
        const sourceFile = new File(sourceUri);

        if (!sourceFile.exists) {
        throw new Error("Selected image file does not exist.");
        }

        // Copy the original image and wait for completion.
        await sourceFile.copy(originalFile);

        if (!originalFile.exists) {
        throw new Error("Original image could not be stored.");
        }

        const thumbnail = await ImageManipulator.manipulateAsync(
        originalFile.uri,
        [{ resize: { width: 400 } }],
        {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
        }
        );

        generatedThumbnail = new File(thumbnail.uri);

        // Copy the thumbnail and wait for completion.
        await generatedThumbnail.copy(thumbnailFile);

        if (!thumbnailFile.exists) {
            throw new Error("Thumbnail image could not be stored.");
        }

        return {
            uri: originalFile.uri,
            thumbnailUri: thumbnailFile.uri,
        };
    } catch (error) {
        this.deleteFileIfExists(originalFile);
        this.deleteFileIfExists(thumbnailFile);
        throw error;
    } finally {
        if (generatedThumbnail) {
        this.deleteTemporaryFileIfExists(generatedThumbnail);
        }
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

  async regenerateThumbnail(
    originalUri: string
  ): Promise<string> {
    if (!originalUri.trim()) {
        throw new Error("Original image URI is required.");
    }

    this.ensureDirectories();

    const originalFile = new File(originalUri);

    if (!originalFile.exists) {
        throw new Error("Original image file does not exist.");
    }

    const id = this.generateId();

    const thumbnailFile = new File(
        this.thumbnailsDirectory,
        `${id}.jpg`
    );

    let generatedThumbnail: File | null = null;

    try {
        const thumbnail = await ImageManipulator.manipulateAsync(
        originalFile.uri,
        [{ resize: { width: 400 } }],
        {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
        }
        );

        generatedThumbnail = new File(thumbnail.uri);

        await generatedThumbnail.copy(thumbnailFile);

        if (!thumbnailFile.exists) {
        throw new Error("Thumbnail could not be stored.");
        }

        return thumbnailFile.uri;
    } catch (error) {
        this.deleteFileIfExists(thumbnailFile);
        throw error;
    } finally {
        if (generatedThumbnail) {
        this.deleteTemporaryFileIfExists(generatedThumbnail);
        }
    }
 }
  
  async listManagedImages(): Promise<{
    originals: string[];
    thumbnails: string[];
  }> {
    this.ensureDirectories();

    return {
        originals: this.originalsDirectory
        .list()
        .filter((entry): entry is File => entry instanceof File)
        .map(file => file.uri),

        thumbnails: this.thumbnailsDirectory
        .list()
        .filter((entry): entry is File => entry instanceof File)
        .map(file => file.uri),
    };
  }


  async deleteManagedImageFile(uri: string): Promise<void> {
    if (uri.startsWith(this.originalsDirectory.uri)) {
        this.deleteManagedFile(uri, this.originalsDirectory);
        return;
    }

    if (uri.startsWith(this.thumbnailsDirectory.uri)) {
        this.deleteManagedFile(uri, this.thumbnailsDirectory);
        return;
    }

    throw new Error("Cannot delete a file outside Kura's image storage.");
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


  private deleteTemporaryFileIfExists(file: File): void {
    try {
        this.deleteFileIfExists(file);
    } catch {
        // Temporary cleanup must not invalidate a successfully stored image.
    }
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
