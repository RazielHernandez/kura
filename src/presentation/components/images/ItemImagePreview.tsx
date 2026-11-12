import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ItemImagePreviewProps {
  uri: string;
  onClose: () => void;
}

export function ItemImagePreview({
  uri,
  onClose,
}: ItemImagePreviewProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Pressable
      style={styles.container}
      onPress={onClose}
    >
      {hasError ? (
        <View style={styles.placeholder}>
          <Text style={styles.icon}>🖼️</Text>
          <Text style={styles.message}>
            This image is no longer available.
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      )}

      <Pressable
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "85%",
  },
  placeholder: {
    alignItems: "center",
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
});