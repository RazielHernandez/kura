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

import { useCustomListStore } from "../../../database/stores/customLists/customListStore";
import { useItemCustomListsStore } from "../../../database/stores/customLists/itemCustomListsStore";

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
    historicalFields,
    isLoading,
    error,
    loadDetails,
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

  const [showCustomLists, setShowCustomLists] = useState(false);

  const customLists = useCustomListStore(
    (state) => state.customLists
  );
  const loadCustomLists = useCustomListStore(
    (state) => state.loadCustomLists
  );
  const isLoadingLists = useCustomListStore(
    (state) => state.isLoading
  );

  const {
    listIds,
    isLoading: isLoadingItemLists,
    isSaving: isSavingItemLists,
    loadListsForItem,
    addToList,
    removeFromList,
  } = useItemCustomListsStore();

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
  
  const handleOpenCustomLists = () => {
    if (!item) return;

    setShowCustomLists(true);

    void loadCustomLists().catch(() => {});
    void loadListsForItem(item.id);
  };

  const handleToggleCustomList = async (listId: string) => {
    if (!item) return;

    try {
      if (listIds.includes(listId)) {
        await removeFromList(listId, item.id);
      } else {
        await addToList(listId, item.id);
      }
    } catch {
      Alert.alert(
        "Error",
        "Could not update this item's Custom Lists."
      );
    }
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

        {/* Historical fields */}
        {historicalFields.length > 0 && (
          <View style={styles.section}>
            <View style={styles.historicalHeader}>
              <Text style={styles.sectionTitle}>
                Historical Fields
              </Text>

              <Text style={styles.historicalBadge}>
                Read only
              </Text>
            </View>

            <Text style={styles.historicalDescription}>
              These fields were removed from the collection.
              Their original values have been preserved.
            </Text>

            {historicalFields.map(({ field, value }) => (
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
            ))}
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
            onPress={handleOpenCustomLists}
          >
            <Text style={styles.actionText}>
              📋 Custom Lists
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

      <Modal
        visible={showCustomLists}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomLists(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.customListsModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Custom Lists</Text>
                <Text style={styles.modalSubtitle}>
                  Choose which lists contain this item.
                </Text>
              </View>

              <Pressable
                onPress={() => setShowCustomLists(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {isLoadingLists || isLoadingItemLists ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : customLists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>
                  You haven't created any Custom Lists yet.
                </Text>

                <Pressable
                  style={styles.createListButton}
                  onPress={() => {
                    setShowCustomLists(false);
                    router.push("/custom-lists/new");
                  }}
                >
                  <Text style={styles.createListButtonText}>
                    Create a List
                  </Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                style={styles.customListsScroll}
                showsVerticalScrollIndicator={false}
              >
                {customLists.map((list) => {
                  const isSelected = listIds.includes(list.id);

                  return (
                    <Pressable
                      key={list.id}
                      style={styles.customListRow}
                      onPress={() => handleToggleCustomList(list.id)}
                      disabled={isSavingItemLists}
                    >
                      <View
                        style={[
                          styles.customListIcon,
                          { backgroundColor: list.color ?? "#DBEAFE" },
                        ]}
                      >
                        <Text style={styles.customListEmoji}>
                          {list.icon ?? "📋"}
                        </Text>
                      </View>

                      <Text style={styles.customListName}>
                        {list.name}
                      </Text>

                      <View
                        style={[
                          styles.customListCheckbox,
                          isSelected && styles.customListCheckboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Text style={styles.customListCheckmark}>✓</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {isSavingItemLists && (
              <ActivityIndicator
                style={styles.modalSaving}
                color="#2563EB"
              />
            )}

            <Pressable
              style={styles.modalDoneButton}
              onPress={() => setShowCustomLists(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
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

  historicalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  historicalBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  historicalDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    marginBottom: 12,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },

  customListsModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "75%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCloseText: {
    fontSize: 16,
    color: "#6B7280",
  },

  modalLoading: {
    padding: 40,
  },

  modalEmpty: {
    alignItems: "center",
    paddingVertical: 30,
  },

  modalEmptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  createListButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  createListButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  customListsScroll: {
    flexGrow: 0,
  },

  customListRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },

  customListIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  customListEmoji: {
    fontSize: 21,
  },

  customListName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  customListCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },

  customListCheckboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  customListCheckmark: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  modalSaving: {
    marginTop: 12,
  },

  modalDoneButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },

  modalDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
