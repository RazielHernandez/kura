import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useCustomListStore } from "../../../database/stores/customLists/customListStore";

const DEFAULT_COLOR = "#2563EB";

const LIST_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#DB2777",
  "#64748B",
];

const LIST_ICONS = [
  "📚",
  "🎮",
  "🎬",
  "🎵",
  "⚽",
  "👕",
  "💎",
  "🧸",
  "🎨",
  "🚗",
  "✈️",
  "❤️",
];


export function EditCustomListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomLists = useCustomListStore(
    (state) => state.loadCustomLists
  );

  const updateCustomList = useCustomListStore(
    (state) => state.updateCustomList
  );

  const isSaving = useCustomListStore(
    (state) => state.isSaving
  );

  useEffect(() => {
    let isMounted = true;

    const loadList = async () => {
      try {
        await loadCustomLists();

        const list = useCustomListStore
          .getState()
          .customLists.find((item) => item.id === id);

        if (!list) {
          throw new Error("Custom List not found.");
        }

        if (isMounted) {
          setName(list.name);
          setIcon(list.icon ?? "📚");
          setColor(list.color ?? DEFAULT_COLOR);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Could not load this list."
        );
        router.back();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      void loadList();
    } else {
      setIsLoading(false);
      router.back();
    }

    return () => {
      isMounted = false;
    };
  }, [id, loadCustomLists]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a list name.");
      return;
    }

    if (!id) return;

    try {
      await updateCustomList({
        id,
        name: name.trim(),
        icon,
        color,
      });

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Could not update the list."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Edit List</Text>

        <Pressable onPress={handleSave} disabled={isSaving}>
          <Text
            style={[
              styles.save,
              isSaving && styles.disabledSave,
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

        <Text style={styles.label}>List name *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Favorite Games"
          value={name}
          onChangeText={setName}
          maxLength={80}
        />

        <Text style={styles.label}>Icon</Text>

        <View style={styles.optionsRow}>
          {LIST_ICONS.map((item) => (
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
          {LIST_COLORS.map((item) => (
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

        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview</Text>

          <View style={styles.previewCard}>
            <View
              style={[
                styles.previewIconContainer,
                { backgroundColor: `${color}18` },
              ]}
            >
              <Text style={styles.previewIcon}>{icon}</Text>
            </View>

            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>
                {name.trim() || "List name"}
              </Text>

              <Text style={styles.previewSubtitle}>
                Custom list
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
    justifyContent: "center",
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
    marginTop: 24,
    marginBottom: 10,
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
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
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
    fontSize: 23,
  },
  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  previewContainer: {
    marginTop: 36,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  previewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  previewIcon: {
    fontSize: 23,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 14,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  previewSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
});
