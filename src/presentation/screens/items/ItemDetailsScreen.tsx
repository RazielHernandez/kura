import React, { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import { useItemDetailsStore } from "../../../database/stores/items/ItemDetailsStore";
import { useItemStore } from "../../../database/stores/items/ItemStore";
import { useItemImageStore } from "../../../database/stores/images/ItemImageStore";
import { ItemGalleryImage } from "../../components/images/ItemGalleryImage";
import { ItemImagePreview } from "../../components/images/ItemImagePreview";

interface ItemDetailsScreenProps {
  itemId: string;
}

export function ItemDetailsScreen({
  itemId,
}: ItemDetailsScreenProps) {
  const {
    item,
    fields,
    values,
    isLoading,
    error,
    loadDetails,
    clearDetails,
  } = useItemDetailsStore();

  const {
    images,
    isLoading: isLoadingImages,
    loadImages,
    clearImages,
  } = useItemImageStore();

  const deleteItem = useItemStore(state => state.deleteItem);
  const isSaving = useItemStore(state => state.isSaving);
  const itemError = useItemStore(state => state.error);
  const clearError = useItemStore(state => state.clearError);
  const [selectedPreviewUri, setSelectedPreviewUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDetails(itemId);
      loadImages(itemId);
    }, [
      itemId,
      loadDetails,
      loadImages,
    ])
  );

  const valuesByFieldId = useMemo(
    () =>
      new Map(
        values.map((value) => [
          value.fieldId,
          value.value,
        ])
      ),
    [values]
  );

  const formatValue = (
    fieldType: string,
    value: string | null
  ) => {
    if (value === null || value === "") {
      return "—";
    }

    if (fieldType === "BOOLEAN") {
      return value === "true" ? "Yes" : "No";
    }

    if (fieldType === "RATING") {
      return `${value} / 5 ★`;
    }

    return value;
  };

  const handleDeleteItem = () => {
        if (!item) return;

        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${item.name}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        clearError();

                        const success = await deleteItem(item.id);

                        if (success) {
                            router.back();
                        }
                    },
                },
            ]
        );
    };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            Loading item...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? "Item not found."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadDetails(itemId)}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Item header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📦</Text>
          </View>

          <Text style={styles.title}>{item.name}</Text>

          {item.favorite && (
            <Text style={styles.favorite}>★ Favorite</Text>
          )}

          {item.description && (
            <Text style={styles.description}>
              {item.description}
            </Text>
          )}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Images ({images.length})
          </Text>

          {isLoadingImages ? (
            <ActivityIndicator size="small" />
          ) : images.length === 0 ? (
            <Text style={styles.emptyText}>No images added yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGallery}
            >
              {/* {images.map((image) => {
                const imageUri = image.thumbnailUri ?? image.uri;
                // const imageUri = image.uri;

                const originalFile = new File(image.uri);
                const thumbnailFile = image.thumbnailUri
                  ? new File(image.thumbnailUri)
                  : null;

                return (
                  <Pressable
                    key={image.id}
                    onPress={() => setSelectedPreviewUri(image.uri)}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                );
              })} */}
              {images.map((image) => (
                <ItemGalleryImage
                  key={image.id}
                  thumbnailUri={image.thumbnailUri}
                  originalUri={image.uri}
                  onPress={() => setSelectedPreviewUri(image.uri)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Custom fields */}
        {fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Custom Fields
            </Text>

            {fields.map((field) => {
              const value =
                valuesByFieldId.get(field.id) ?? null;

              return (
                <View
                  key={field.id}
                  style={styles.fieldRow}
                >
                  <Text style={styles.fieldName}>
                    {field.name}
                  </Text>

                  <Text style={styles.fieldValue}>
                    {formatValue(field.fieldType, value)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions - placeholders for future implementation */}
        <View style={styles.actions}>
          <Pressable
              style={styles.actionButton}
              onPress={() =>
                  router.push(
                  `/collections/${item.collectionId}/items/${item.id}/edit`
                  )
              }
              >
              <Text style={styles.actionText}>
                  ✏️ Edit Item
              </Text>
          </Pressable>

          <Pressable
              style={styles.actionButton}
              onPress={handleDeleteItem}
              >
              <Text style={styles.actionText}>
                  🗑️ Delete Item
              </Text>
          </Pressable>

          {itemError && (
              <Text style={{ color: "red" }}>
                  {itemError}
              </Text>
          )}

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push(
                `/collections/${item.collectionId}/items/${item.id}/notes`
              )
            }
          >
            <Text style={styles.actionText}>📝 Notes</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
                router.push(
                    `/collections/${item.collectionId}/items/${item.id}/history`
                )
            }
          >
            <Text style={styles.actionText}>📜 History</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* <Modal
        visible={selectedPreviewUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreviewUri(null)}
      >
        <Pressable
          style={styles.imagePreviewBackdrop}
          onPress={() => setSelectedPreviewUri(null)}
        >
          {selectedPreviewUri && (
            <Image
              source={{ uri: selectedPreviewUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}

          <Pressable
            style={styles.closePreviewButton}
            onPress={() => setSelectedPreviewUri(null)}
          >
            <Text style={styles.closePreviewText}>✕</Text>
          </Pressable>
        </Pressable>
      </Modal> */}

      <Modal
        visible={selectedPreviewUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreviewUri(null)}
      >
        {selectedPreviewUri && (
          <ItemImagePreview
            uri={selectedPreviewUri}
            onClose={() => setSelectedPreviewUri(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  favorite: {
    marginTop: 8,
    color: "#D97706",
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  fieldRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  fieldName: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },

  imageGallery: {
    gap: 12,
  },

  galleryImage: {
    width: 120,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  imagePreviewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullScreenImage: {
    width: "100%",
    height: "85%",
  },

  closePreviewButton: {
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

  closePreviewText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
});
