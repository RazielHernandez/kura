import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ItemGalleryImageProps {
  thumbnailUri: string | null;
  originalUri: string;
  onPress: () => void;
}

export function ItemGalleryImage({
  thumbnailUri,
  originalUri,
  onPress,
}: ItemGalleryImageProps) {
  const initialUri = thumbnailUri ?? originalUri;

  const [imageUri, setImageUri] = useState(initialUri);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    // If the thumbnail fails, try the original image.
    if (imageUri !== originalUri) {
      setImageUri(originalUri);
      return;
    }

    // Both image files are unavailable.
    setHasError(true);
  };

  return (
    <Pressable onPress={onPress}>
      {hasError ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>🖼️</Text>
          <Text style={styles.placeholderText}>
            Image unavailable
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  placeholder: {
    width: 120,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  placeholderIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
});