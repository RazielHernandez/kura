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
import { SafeAreaView } from "react-native-safe-area-context";

import { ItemNote } from "../../../database/models/ItemNote";

import { useItemNoteStore } from "../../../database/stores/notes/ItemNoteStore";

interface ItemNotesScreenProps {
  itemId: string;
}

export function ItemNotesScreen({
  itemId,
}: ItemNotesScreenProps) {
  const {
    notes,
    isLoading,
    isSaving,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    clearNotes,
    clearError,
  } = useItemNoteStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] =
    useState<ItemNote | null>(null);

  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(
    null
  );


    useEffect(() => {
        loadNotes(itemId);

        return () => {
            clearNotes();
        };
    }, [itemId, loadNotes, clearNotes]);

  const openCreateModal = () => {
    setSelectedNote(null);
    setContent("");
    setLocalError(null);
    clearError();
    setModalVisible(true);
  };

  const openEditModal = (note: ItemNote) => {
    setSelectedNote(note);
    setContent(note.content);
    setLocalError(null);
    clearError();
    setModalVisible(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setModalVisible(false);
    setSelectedNote(null);
    setContent("");
    setLocalError(null);
    clearError();
  };

  const handleSave = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setLocalError("Please enter some content for your note.");
      return;
    }

    setLocalError(null);

    let success: boolean;

    if (selectedNote) {
      success = await updateNote(
        selectedNote.id,
        trimmedContent
      );
    } else {
      success = await createNote(itemId, trimmedContent);
    }

    if (success) {
      setModalVisible(false);
      setSelectedNote(null);
      setContent("");
    }
  };

  const handleDelete = (note: ItemNote) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNote(note.id);
          },
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>
            {notes.length === 1
              ? "1 note"
              : `${notes.length} notes`}
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <Text style={styles.addButtonText}>+ Add Note</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={() => loadNotes(itemId)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {isLoading && notes.length === 0 ? (
            <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
        ) : notes.length === 0 && !error ? (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Text style={styles.emptyIconText}>✎</Text>
                </View>

                <Text style={styles.emptyTitle}>
                    No notes yet
                </Text>

                <Text style={styles.emptyDescription}>
                    Keep track of important details, thoughts, and
                    information about this item.
                </Text>

                <Pressable
                    style={styles.emptyButton}
                    onPress={openCreateModal}
                >
                    <Text style={styles.emptyButtonText}>
                        Create your first note
                    </Text>
                </Pressable>
            </View>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteDate}>
                  Updated {formatDate(note.updatedAt)}
                </Text>

                <View style={styles.noteActions}>
                  <Pressable
                    onPress={() => openEditModal(note)}
                    hitSlop={8}
                  >
                    <Text style={styles.editAction}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(note)}
                    hitSlop={8}
                  >
                    <Text style={styles.deleteAction}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.noteContent}>
                {note.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedNote ? "Edit Note" : "New Note"}
              </Text>

              <Pressable
                onPress={closeModal}
                disabled={isSaving}
              >
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              Note content
            </Text>

            <TextInput
              style={styles.noteInput}
              value={content}
              onChangeText={(value) => {
                setContent(value);
                setLocalError(null);
                clearError();
              }}
              placeholder="Write something..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              autoFocus
              editable={!isSaving}
            />

            {localError && (
              <Text style={styles.errorText}>
                {localError}
              </Text>
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
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
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
                    {selectedNote ? "Save Changes" : "Save Note"}
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
    backgroundColor: "#F9FAFB",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },

  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  noteDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  noteActions: {
    flexDirection: "row",
    gap: 16,
  },

  editAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  deleteAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
  },

  noteContent: {
    fontSize: 15,
    lineHeight: 23,
    color: "#374151",
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIconText: {
    fontSize: 32,
    color: "#2563EB",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 22,
  },

  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    color: "#6B7280",
    marginTop: 12,
  },

  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
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
    color: "#111827",
  },

  closeButton: {
    fontSize: 22,
    color: "#6B7280",
    padding: 4,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },

  noteInput: {
    minHeight: 180,
    maxHeight: 280,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
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
    backgroundColor: "#F3F4F6",
  },

  cancelButtonText: {
    color: "#374151",
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