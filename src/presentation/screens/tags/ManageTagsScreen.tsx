
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Tag } from "../../../database/models/Tag";
import { useTagStore } from "../../../database/stores/tags/TagStore";

interface ManageTagsScreenProps {
  collectionId: string;
}

const TAG_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#D97706",
  "#9333EA",
  "#DB2777",
  "#0891B2",
  "#475569",
  "#0F172A",
  "#64748B",
];

export function ManageTagsScreen({
  collectionId,
}: ManageTagsScreenProps) {
  const tags = useTagStore((state) => state.tags);
  const isLoading = useTagStore((state) => state.isLoading);
  const isSaving = useTagStore((state) => state.isSaving);
  const error = useTagStore((state) => state.error);

  const loadTags = useTagStore((state) => state.loadTags);
  const createTag = useTagStore((state) => state.createTag);
  const updateTag = useTagStore((state) => state.updateTag);
  const deleteTag = useTagStore((state) => state.deleteTag);
  const clearTags = useTagStore((state) => state.clearTags);
  const clearError = useTagStore((state) => state.clearError);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    loadTags(collectionId);

    return () => {
      clearTags();
    };
  }, [collectionId, loadTags, clearTags]);

  const openCreateModal = () => {
    setSelectedTag(null);
    setName("");
    setColor(TAG_COLORS[0]);
    setLocalError(null);
    clearError();
    setModalVisible(true);
  };

  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setName(tag.name);
    setColor(tag.color ?? TAG_COLORS[0]);
    setLocalError(null);
    clearError();
    setModalVisible(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setModalVisible(false);
    setSelectedTag(null);
    setName("");
    setLocalError(null);
    clearError();
  };

  const handleSave = async () => {

    const trimmedName = name.trim();

    if (!trimmedName) {
        setLocalError("Please enter a tag name.");
        return;
    }

    setLocalError(null);

    const success = selectedTag
        ? await updateTag(selectedTag.id, trimmedName, color)
        : await createTag(collectionId, trimmedName, color);


    if (success) {
        setModalVisible(false);
        setSelectedTag(null);
        setName("");
    }
    };

  const handleDelete = (tag: Tag) => {
    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${tag.name}"? This will remove it from all associated items.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTag(tag.id);
          },
        },
      ]
    );
  };

  if (isLoading && tags.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>Loading tags...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Manage Tags</Text>

        <Pressable onPress={openCreateModal}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadTags(collectionId)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tags.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyTitle}>No tags yet</Text>
            <Text style={styles.emptyDescription}>
              Create tags to organize and categorize the items
              in this collection.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={openCreateModal}
            >
              <Text style={styles.primaryButtonText}>
                Create your first tag
              </Text>
            </Pressable>
          </View>
        ) : (
          tags.map((tag) => {
            const tagColor = tag.color ?? "#64748B";

            return (
              <View key={tag.id} style={styles.tagCard}>
                <View
                  style={[
                    styles.tagColorIndicator,
                    { backgroundColor: tagColor },
                  ]}
                />

                <View style={styles.tagInfo}>
                  <View
                    style={[
                      styles.tagBadge,
                      {
                        backgroundColor: `${tagColor}18`,
                        borderColor: `${tagColor}40`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagName,
                        { color: tagColor },
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagActions}>
                  <Pressable
                    onPress={() => openEditModal(tag)}
                    hitSlop={8}
                  >
                    <Text style={styles.editAction}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(tag)}
                    hitSlop={8}
                  >
                    <Text style={styles.deleteAction}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={closeModal}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTag ? "Edit Tag" : "New Tag"}
              </Text>

              <Pressable
                onPress={closeModal}
                disabled={isSaving}
              >
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Tag name</Text>

            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setLocalError(null);
                clearError();
              }}
              placeholder="e.g. Important"
              placeholderTextColor="#9CA3AF"
              maxLength={40}
              editable={!isSaving}
              autoFocus
            />

            <Text style={styles.inputLabel}>Tag color</Text>

            <View style={styles.colorsContainer}>
              {TAG_COLORS.map((tagColor) => (
                <Pressable
                  key={tagColor}
                  style={[
                    styles.colorOption,
                    { backgroundColor: tagColor },
                    color === tagColor && styles.selectedColor,
                  ]}
                  onPress={() => setColor(tagColor)}
                  disabled={isSaving}
                >
                  {color === tagColor && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <View
              style={[
                styles.previewBadge,
                {
                  backgroundColor: `${color}18`,
                  borderColor: `${color}40`,
                },
              ]}
            >
              <Text style={[styles.previewText, { color }]}>
                {name.trim() || "Tag preview"}
              </Text>
            </View>

            {localError && (
              <Text style={styles.errorText}>{localError}</Text>
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {selectedTag ? "Save Changes" : "Create Tag"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  addText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  tagCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tagColorIndicator: {
    width: 5,
    height: 34,
    borderRadius: 4,
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagName: {
    fontSize: 13,
    fontWeight: "700",
  },
  tagActions: {
    flexDirection: "row",
    gap: 16,
    marginLeft: 12,
  },
  editAction: {
    color: "#2563EB",
    fontWeight: "600",
  },
  deleteAction: {
    color: "#DC2626",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#64748B",
    marginTop: 12,
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 6,
  },
  retryText: {
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeButton: {
    fontSize: 22,
    color: "#64748B",
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 9,
  },
  nameInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 20,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  colorCheck: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  previewBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  previewText: {
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
