
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
} from "react-native";

import { router } from "expo-router";
import { useItemDetailsStore } from "../../../database/stores/items/ItemDetailsStore";
import { useItemStore } from "../../../database/stores/items/ItemStore";
import { DynamicFieldInput } from "../../components/items/DynamicFieldInput";
import { SafeAreaView } from "react-native-safe-area-context";

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
    updateItem,
    isSaving,
    error: saveError,
    clearError,
  } = useItemStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [favorite, setFavorite] = useState(false);

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
            disabled={isSaving}
            onPress={handleSave}
          >
            {isSaving ? (
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
});
