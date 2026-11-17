
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import { FieldType } from "../../../database/models/CollectionField";
import { useCollectionStore } from "../../../database/stores/collections/collectionStore";
import { useCollectionDetailsStore } from "../../../database/stores/collections/CollectionDetailsStore";

import { CollectionFieldList } from "../../components/collections/CollectionFieldList";
import { CollectionFieldForm } from "../../components/collections/CollectionFieldForm";

export interface DraftCollectionField {
  id: string;
  name: string;
  fieldType: FieldType;
  required: boolean;
}

interface CreateCollectionScreenProps {
  collectionId?: string;
}

const DEFAULT_COLOR = "#2563EB";

const COLLECTION_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#DB2777",
  "#64748B",
];

const COLLECTION_ICONS = [
  "📦",
  "📚",
  "🎮",
  "👕",
  "🎨",
  "⚽",
  "💎",
  "🧸",
  "🎵",
  "🚗",
];

export function CreateCollectionScreen({
  collectionId,
}: CreateCollectionScreenProps) {
  const isEditing = Boolean(collectionId);

  const createCollection = useCollectionStore(
    (state) => state.createCollection
  );

  const updateCollection = useCollectionStore(
    (state) => state.updateCollection
  );

  const isSaving = useCollectionStore(
    (state) => state.isSaving
  );

  const loadDetails = useCollectionDetailsStore(
    (state) => state.loadDetails
  );

  const collection = useCollectionDetailsStore(
    (state) => state.collection
  );

  const existingFields = useCollectionDetailsStore(
    (state) => state.fields
  );

  const isLoading = useCollectionDetailsStore(
    (state) => state.isLoading
  );

  const loadingError = useCollectionDetailsStore(
    (state) => state.error
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const [fields, setFields] = useState<DraftCollectionField[]>([]);
  const [originalFieldIds, setOriginalFieldIds] = useState<string[]>([]);

  const [fieldFormVisible, setFieldFormVisible] = useState(false);
  const [editingField, setEditingField] =
    useState<DraftCollectionField | null>(null);

  useEffect(() => {
    if (!collectionId) return;

    let cancelled = false;

    const loadCollection = async () => {
      await loadDetails(collectionId);

      if (cancelled) return;

      const state = useCollectionDetailsStore.getState();

      if (!state.collection || state.collection.id !== collectionId) {
        return;
      }

      const loadedCollection = state.collection;

      setName(loadedCollection.name);
      setDescription(loadedCollection.description ?? "");
      setIcon(loadedCollection.icon ?? "📦");
      setColor(loadedCollection.color ?? DEFAULT_COLOR);

      setOriginalFieldIds(
        state.fields.map((field) => field.id)
      );

      setFields(
        state.fields.map((field) => ({
          id: field.id,
          name: field.name,
          fieldType: field.fieldType,
          required: field.required,
        }))
      );
    };

    void loadCollection();

    return () => {
      cancelled = true;
    };
  }, [collectionId, loadDetails]);

  const handleAddField = () => {
    setEditingField(null);
    setFieldFormVisible(true);
  };

  const handleSaveField = (
    field: Omit<DraftCollectionField, "id">
  ) => {
    if (editingField) {
      setFields((current) =>
        current.map((item) =>
          item.id === editingField.id
            ? { ...item, ...field }
            : item
        )
      );
    } else {
      setFields((current) => [
        ...current,
        {
          ...field,
          id: `draft-${Date.now()}-${Math.random()}`,
        },
      ]);
    }

    setFieldFormVisible(false);
    setEditingField(null);
  };

  const handleEditField = (field: DraftCollectionField) => {
    setEditingField(field);
    setFieldFormVisible(true);
  };

  const handleDeleteField = (id: string) => {
    setFields((current) =>
      current.filter((field) => field.id !== id)
    );
  };

  const handleSaveCollection = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Collection name is required.");
      return;
    }

    try {
      if (isEditing && collectionId) {
        const existingIds = new Set(originalFieldIds);

        await updateCollection({
          collectionId,
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
          fields: fields.map((field) => ({
            ...(existingIds.has(field.id)
              ? { id: field.id }
              : {}),
            name: field.name,
            fieldType: field.fieldType,
            required: field.required,
          })),
        });
      } else {
        await createCollection({
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
          fields: fields.map((field) => ({
            name: field.name,
            fieldType: field.fieldType,
            required: field.required,
          })),
        });
      }

      router.back();
    } catch (error) {
      Alert.alert(
        isEditing
          ? "Unable to update collection"
          : "Unable to create collection",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  if (isEditing && (!collection || collection.id !== collectionId)) {
    return (
      <View style={styles.loadingContainer}>
        {isLoading ? (
          <>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>
              Loading collection...
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>
              {loadingError ?? "Unable to load collection."}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => collectionId && loadDetails(collectionId)}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.cancel}>Go back</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Collection" : "New Collection"}
          </Text>

          <Pressable
            onPress={handleSaveCollection}
            disabled={isSaving || isLoading}
          >
            <Text
              style={[
                styles.save,
                (isSaving || isLoading) && styles.disabledSave,
              ]}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>General</Text>

          <Text style={styles.label}>Collection name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Video Games"
            value={name}
            onChangeText={setName}
            maxLength={80}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="What do you want to collect?"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Icon</Text>
          <View style={styles.optionsRow}>
            {COLLECTION_ICONS.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.iconOption,
                  icon === item && styles.selectedOption,
                ]}
                onPress={() => setIcon(item)}
              >
                <Text style={styles.iconText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Color</Text>
          <View style={styles.optionsRow}>
            {COLLECTION_COLORS.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.colorOption,
                  { backgroundColor: item },
                  color === item && styles.selectedColor,
                ]}
                onPress={() => setColor(item)}
              />
            ))}
          </View>

          <View style={styles.fieldsHeader}>
            <Text style={styles.sectionTitle}>Custom Fields</Text>

            <Pressable onPress={handleAddField}>
              <Text style={styles.addField}>+ Add field</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldHint}>
            Define the information you want to save for each item.
          </Text>

          <CollectionFieldList
            fields={fields}
            onEdit={handleEditField}
            onDelete={handleDeleteField}
          />
        </ScrollView>
      </View>

      <CollectionFieldForm
        visible={fieldFormVisible}
        initialField={editingField}
        onCancel={() => {
          setFieldFormVisible(false);
          setEditingField(null);
        }}
        onSave={handleSaveField}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    height: 55,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancel: {
    color: "#64748B",
  },
  save: {
    color: "#2563EB",
    fontWeight: "600",
  },
  disabledSave: {
    opacity: 0.5,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#334155",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedOption: {
    borderColor: "#2563EB",
    borderWidth: 2,
  },
  iconText: {
    fontSize: 22,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  fieldsHeader: {
    marginTop: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addField: {
    color: "#2563EB",
    fontWeight: "600",
  },
  fieldHint: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },
});
