
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { useItemDetailsStore } from "../../../database/stores/items/ItemDetailsStore";
import { useItemStore } from "../../../database/stores/items/ItemStore";
import { DynamicFieldInput } from "../../components/items/DynamicFieldInput";
import { SafeAreaView } from "react-native-safe-area-context";

import { Image } from "react-native";
import { imagePickerService } from "../../../database/services/ImagePickerService";
import { SelectedImage } from "../../../database/services/ImagePickerService";
import { useItemImageStore } from "../../../database/stores/images/ItemImageStore";

interface EditItemScreenProps {
  itemId: string;
}

export function EditItemScreen({
  itemId,
}: EditItemScreenProps) {
  const {
    item,
    fields,
    values,
    isLoading,
    error: loadError,
    loadDetails,
    clearDetails,
  } = useItemDetailsStore();

  const {
    images,
    isLoading: isLoadingImages,
    isSaving: isSavingImages,
    error: imageError,
    loadImages,
    addImages,
    deleteImage,
    reorderImages,
    clearImages,
  } = useItemImageStore();

  const {
    updateItem,
    isSaving,
    error: saveError,
    clearError,
  } = useItemStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [favorite, setFavorite] = useState(false);

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isPickingImages, setIsPickingImages] = useState(false);

  const [fieldValues, setFieldValues] = useState<
    Record<string, string | null>
  >({});

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadDetails(itemId);

    return () => {
      clearError();
    };
  }, [itemId]);

  useEffect(() => {
    loadImages(itemId);

    return () => {
      clearImages();
    };
  }, [itemId]);

  useEffect(() => {
    if (!item || initialized) {
      return;
    }

    setName(item.name);
    setDescription(item.description ?? "");
    setFavorite(item.favorite);

    const initialValues: Record<string, string | null> = {};

    values.forEach((value) => {
      initialValues[value.fieldId] = value.value;
    });

    setFieldValues(initialValues);
    setInitialized(true);
  }, [item, values, initialized]);

  const handleValueChange = (
    fieldId: string,
    value: string | null
  ) => {
    setFieldValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handlePickImages = async () => {
    try {
      setIsPickingImages(true);

      const selected = await imagePickerService.pickImages();

      if (selected.length === 0) {
        return;
      }

      setSelectedImages((current) => [
        ...current,
        ...selected,
      ]);
    } catch (error) {
      Alert.alert(
        "Unable to select images",
        error instanceof Error
          ? error.message
          : "Something went wrong while selecting images."
      );
    } finally {
      setIsPickingImages(false);
    }
  };

  const handleRemoveSelectedImage = (uri: string) => {
    setSelectedImages((current) =>
      current.filter((image) => image.uri !== uri)
    );
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    Alert.alert(
      "Delete image",
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteImage(imageId);

            if (!success) {
              Alert.alert(
                "Unable to delete image",
                useItemImageStore.getState().error ??
                  "Something went wrong."
              );
            }
          },
        },
      ]
    );
  };

  const handleMoveImage = async (
    imageId: string,
    direction: "left" | "right"
  ) => {
    const currentIndex = images.findIndex(
      image => image.id === imageId
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const reorderedImages = [...images];

    const [movedImage] = reorderedImages.splice(currentIndex, 1);

    reorderedImages.splice(targetIndex, 0, movedImage);

    const success = await reorderImages(
      itemId,
      reorderedImages.map(image => image.id)
    );

    if (!success) {
      Alert.alert(
        "Unable to reorder images",
        useItemImageStore.getState().error ??
          "Something went wrong."
      );
    }
  };

  const handleSave = async () => {
    if (!item) return;

    if (!name.trim()) {
      setSaveErrorMessage("Please enter an item name.");
      return;
    }

    const updatedItem = await updateItem({
      itemId: item.id,
      name: name.trim(),
      description: description.trim() || null,
      favorite,
      values: fields.map((field) => ({
        fieldId: field.id,
        value: fieldValues[field.id] ?? null,
      })),
    });

    if (!updatedItem) {
      return;
    }

    // Save newly selected images.
    if (selectedImages.length > 0) {
      const success = await addImages(
        item.id,
        selectedImages.map((image) => image.uri)
      );

      if (!success) {
        return;
      }
    }

    // Reload details so the previous screen has fresh data.
    await loadDetails(item.id);

    router.back();
  };

  const setSaveErrorMessage = (message: string) => {
    // Store validation errors are normally handled by ItemStore.
    // This local message is displayed below.
    setLocalError(message);
  };

  const [localError, setLocalError] = useState<string | null>(null);

  if (isLoading || !initialized) {
    if (loadError) {
      return (
        <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
          <View style={styles.center}>
            <Text style={styles.error}>{loadError}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <Text style={styles.error}>
            {loadError ?? "Item not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom"]}
    >
      <View style={styles.screenContent}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Edit Item</Text>

          <Text style={styles.subtitle}>
            Update {item.name}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Basic Information
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                style={styles.input}
                maxLength={120}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description..."
                style={[styles.input, styles.textArea]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.favoriteRow}>
              <Text style={styles.label}>Favorite</Text>

              <Switch
                value={favorite}
                onValueChange={setFavorite}
              />
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <View style={styles.imageHeader}>
              <View>
                <Text style={styles.sectionTitle}>Images</Text>
                <Text style={styles.helperText}>
                  Manage photos associated with this item
                </Text>
              </View>

              <Text style={styles.imageCount}>
                {images.length + selectedImages.length} photos
              </Text>
            </View>

            <Pressable
              style={styles.addImagesButton}
              onPress={handlePickImages}
              disabled={isPickingImages || isSavingImages}
            >
              {isPickingImages ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <>
                  <Text style={styles.addImagesIcon}>＋</Text>
                  <Text style={styles.addImagesText}>Add Photos</Text>
                </>
              )}
            </Pressable>

            {isLoadingImages ? (
              <ActivityIndicator
                style={styles.imagesLoading}
                color="#2563EB"
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageList}
              >
                {images.map((image, index) => (
                  <View key={image.id} style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: image.thumbnailUri ?? image.uri }}
                      // source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />

                    {/* Delete */}
                    <Pressable
                      style={styles.removeImageButton}
                      onPress={() => handleDeleteExistingImage(image.id)}
                      disabled={isSavingImages}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </Pressable>

                    {/* Reordering */}
                    <View style={styles.imageReorderControls}>
                      <Pressable
                        style={[
                          styles.imageMoveButton,
                          index === 0 && styles.imageMoveButtonDisabled,
                        ]}
                        disabled={index === 0 || isSavingImages}
                        onPress={() => handleMoveImage(image.id, "left")}
                      >
                        <Text style={styles.imageMoveText}>←</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.imageMoveButton,
                          index === images.length - 1 &&
                            styles.imageMoveButtonDisabled,
                        ]}
                        disabled={
                          index === images.length - 1 || isSavingImages
                        }
                        onPress={() => handleMoveImage(image.id, "right")}
                      >
                        <Text style={styles.imageMoveText}>→</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

                {selectedImages.map((image) => (
                  <View key={image.uri} style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />

                    <View style={styles.newImageBadge}>
                      <Text style={styles.newImageBadgeText}>NEW</Text>
                    </View>

                    <Pressable
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveSelectedImage(image.uri)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {imageError && (
              <Text style={styles.imageError}>{imageError}</Text>
            )}
          </View>

          {fields.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Custom Fields
              </Text>

              {fields.map((field) => (
                <DynamicFieldInput
                  key={field.id}
                  field={field}
                  value={fieldValues[field.id] ?? null}
                  onChange={(value) =>
                    handleValueChange(field.id, value)
                  }
                />
              ))}
            </View>
          )}

          {(localError || saveError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>
                {localError ?? saveError}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.saveButton,
              isSaving && styles.disabledButton,
            ]}
            disabled={isSaving || isSavingImages}
            onPress={handleSave}
          >
            {isSaving || isSavingImages ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  screenContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 28,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#E53935",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 10,
  },
  error: {
    color: "#DC2626",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },

  imageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },

  imageCount: {
    fontSize: 12,
    color: "#6B7280",
  },

  addImagesButton: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  addImagesIcon: {
    fontSize: 28,
    color: "#2563EB",
    marginBottom: 4,
  },

  addImagesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  imagesLoading: {
    marginTop: 20,
  },

  imageList: {
    gap: 12,
    paddingTop: 16,
  },

  imagePreviewContainer: {
    width: 110,
    height: 150,
    position: "relative",
  },

  imagePreview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },

  removeImageText: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "600",
  },

  imageError: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 12,
  },

  newImageBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#2563EB",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  newImageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  imageReorderControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 6,
  },

  imageMoveButton: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  imageMoveButtonDisabled: {
    opacity: 0.3,
  },

  imageMoveText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },
});
