
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  const [localError, setLocalError] = useState<string | null>(null);

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
    clearError();

    const success = selectedNote
      ? await updateNote(selectedNote.id, trimmedContent)
      : await createNote(itemId, trimmedContent);

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
        { text: "Cancel", style: "cancel" },
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

  const isEditing = selectedNote !== null;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>
            {notes.length === 1
              ? "1 note"
              : `${notes.length} notes`}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
          onPress={openCreateModal}
          accessibilityRole="button"
          accessibilityLabel="Add note"
        >
          <Text style={styles.addButtonIcon}>＋</Text>
          <Text style={styles.addButtonText}>Add Note</Text>
        </Pressable>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadNotes(itemId)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Notes */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          notes.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

            <Text style={styles.emptyTitle}>No notes yet</Text>

            <Text style={styles.emptyDescription}>
              Keep track of important details, thoughts, and
              information about this item.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.pressed,
              ]}
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
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>LAST UPDATED</Text>
                  <Text style={styles.noteDate}>
                    {formatDate(note.updatedAt)}
                  </Text>
                </View>

                <View style={styles.noteActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => openEditModal(note)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Edit note"
                  >
                    <Text style={styles.editIcon}>✎</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleDelete(note)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                  >
                    <Text style={styles.deleteIcon}>⌫</Text>
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

      {/* Create / Edit modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeModal}
            disabled={isSaving}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Edit Note" : "New Note"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditing
                    ? "Update your item notes"
                    : "Add some details about this item"}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeModal}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Close editor"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>NOTE CONTENT</Text>

            <TextInput
              style={styles.noteInput}
              value={content}
              onChangeText={(value) => {
                setContent(value);
                setLocalError(null);
                clearError();
              }}
              placeholder="Write something worth remembering..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              autoFocus
              editable={!isSaving}
              maxLength={10000}
            />

            <View style={styles.inputFooter}>
              <Text style={styles.characterCount}>
                {content.length} / 10,000
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
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
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
                    {isEditing ? "Save Changes" : "Save Note"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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

  headerText: {
    flex: 1,
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
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  addButtonIcon: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "500",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  pressed: {
    opacity: 0.75,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },

  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  dateContainer: {
    gap: 4,
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#9CA3AF",
  },

  noteDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  noteActions: {
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  editIcon: {
    fontSize: 18,
    color: "#2563EB",
  },

  deleteIcon: {
    fontSize: 19,
    color: "#DC2626",
  },

  noteContent: {
    fontSize: 15,
    lineHeight: 23,
    color: "#374151",
  },

  emptyContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIconText: {
    fontSize: 34,
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
    paddingVertical: 13,
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
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 24,
  },

  modalHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    fontSize: 15,
    color: "#6B7280",
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#6B7280",
    marginBottom: 10,
  },

  noteInput: {
    minHeight: 180,
    maxHeight: 280,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 15,
    fontSize: 15,
    lineHeight: 23,
    color: "#111827",
  },

  inputFooter: {
    alignItems: "flex-end",
    marginTop: 7,
  },

  characterCount: {
    fontSize: 11,
    color: "#9CA3AF",
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
