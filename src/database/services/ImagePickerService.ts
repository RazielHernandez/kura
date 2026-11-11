import * as ImagePicker from "expo-image-picker";

export interface SelectedImage {
  uri: string;
  fileName: string | null | undefined;
  mimeType: string | null | undefined;
  width: number;
  height: number;
}

class ImagePickerService {
  async pickImages(): Promise<SelectedImage[]> {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Permission to access photos is required.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1,
    });

    if (result.canceled) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
    }));
  }
}

export const imagePickerService = new ImagePickerService();
