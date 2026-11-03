
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
import { useCollectionDetailsStore } from "../../../database/stores/collections/CollectionDetailsStore";
import { useItemStore } from "../../../database/stores/items/ItemStore";
import { DynamicFieldInput } from "../../components/items/DynamicFieldInput";


interface CreateItemScreenProps {
  collectionId: string;
}

export function CreateItemScreen({
  collectionId,
}: CreateItemScreenProps) {
  const {
    collection,
    fields,
    isLoading: isLoadingCollection,
    error: collectionError,
    loadDetails,
    clearDetails,
  } = useCollectionDetailsStore();

  const {
    createItem,
    isSaving,
    error: itemError,
    clearError,
  } = useItemStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [favorite, setFavorite] = useState(false);

  const [values, setValues] = useState<
    Record<string, string | null>
  >({});

//   useEffect(() => {
//     loadDetails(collectionId);

//     return () => {
//       clearDetails();
//       clearError();
//     };
//   }, [collectionId]);
    useEffect(() => {
    loadDetails(collectionId);

    return () => {
        clearError();
    };
    }, [collectionId]);

  const handleValueChange = (
    fieldId: string,
    value: string | null
  ) => {
    setValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        "Missing name",
        "Please enter an item name."
      );
      return;
    }

    const itemValues = fields.map((field) => ({
      fieldId: field.id,
      value: values[field.id] ?? null,
    }));

    const item = await createItem({
      collectionId,
      name: trimmedName,
      description: description.trim() || null,
      favorite,
      values: itemValues,
    });

    if (!item) {
      return;
    }

    router.back();
  };

  if (isLoadingCollection) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading collection...
        </Text>
      </View>
    );
  }

  if (collectionError || !collection) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {collectionError ?? "Collection not found."}
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => loadDetails(collectionId)}
        >
          <Text style={styles.secondaryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>New Item</Text>
          <Text style={styles.subtitle}>
            Add an item to {collection.name}
          </Text>
        </View>

        {/* Basic information */}
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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.favoriteRow}>
            <View>
              <Text style={styles.label}>Favorite</Text>
              <Text style={styles.helperText}>
                Add this item to your favorites
              </Text>
            </View>

            <Switch
              value={favorite}
              onValueChange={setFavorite}
            />
          </View>
        </View>

        {/* Dynamic custom fields */}
        {fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Custom Fields
            </Text>

            {fields.map((field) => (
              <DynamicFieldInput
                key={field.id}
                field={field}
                value={values[field.id] ?? null}
                onChange={(value) =>
                  handleValueChange(field.id, value)
                }
              />
            ))}
          </View>
        )}

        {itemError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {itemError}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.createButton,
            isSaving && styles.disabledButton,
          ]}
          onPress={handleCreate}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>
              Create Item
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  header: {
    marginBottom: 28,
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
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  createButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
});
