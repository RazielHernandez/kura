
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { FieldType } from "../../../database/models/CollectionField";
import { useCollectionStore } from "../../../database/stores/collections/collectionStore";
import { CollectionFieldList } from "../../components/collections/CollectionFieldList";
import { CollectionFieldForm } from "../../components/collections/CollectionFieldForm";


export interface DraftCollectionField {
  id: string;
  name: string;
  fieldType: FieldType;
  required: boolean;
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

export function CreateCollectionScreen() {
  const createCollection = useCollectionStore(
    (state) => state.createCollection
  );

  const isSaving = useCollectionStore(
    (state) => state.isSaving
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const [fields, setFields] = useState<DraftCollectionField[]>([]);
  const [fieldFormVisible, setFieldFormVisible] = useState(false);
  const [editingField, setEditingField] =
    useState<DraftCollectionField | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setFieldFormVisible(true);
  };

  const handleSaveField = (field: Omit<DraftCollectionField, "id">) => {
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
          id: `${Date.now()}-${Math.random()}`,
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

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to create collection",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>New Collection</Text>

          <Pressable
            onPress={handleSaveCollection}
            disabled={isSaving}
          >
            <Text style={styles.save}>
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
