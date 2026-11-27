import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useCustomListDetailsStore } from "../../../database/stores/customLists/customListDetailsStore";
import { ItemWithCollection } from "../../../database/models/Item";


export function CustomListDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    customList,
    items,
    isLoading,
    isSaving,
    error,
    loadDetails,
    removeItem,
    deleteList,
    clearDetails,
  } = useCustomListDetailsStore();

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadDetails(id);
      }

      return () => {
        clearDetails();
      };
    }, [id, loadDetails, clearDetails])
  );

  const handleRemoveItem = (item: ItemWithCollection) => {
    if (!id) return;

    Alert.alert(
      "Remove item",
      `Remove "${item.name}" from this list? The original item will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItem(item.id),
        },
      ]
    );
  };

  const handleDeleteList = () => {
    if (!id) return;

    Alert.alert(
        "Delete Custom List",
        `Are you sure you want to delete "${customList?.name}"? The items in this list will not be deleted.`,
        [
        {
            text: "Cancel",
            style: "cancel",
        },
        {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
            try {
                await deleteList();
                router.replace("/(tabs)/custom-lists");
            } catch {
                Alert.alert(
                "Error",
                "Could not delete this custom list."
                );
            }
            },
        },
        ]
    );
  };

  const renderItem = ({ item }: { item: ItemWithCollection }) => (
    <View style={styles.itemCard}>
      <Pressable
        style={styles.itemInfo}
        onPress={() =>
          router.push(
            `/collections/${item.collectionId}/items/${item.id}`
          )
        }
      >
        <View style={styles.itemIcon}>
          <Text style={styles.itemIconText}>📦</Text>
        </View>

        <View style={styles.itemTextContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.collectionName}>
            {item.collectionName}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading list...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !customList) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? "List not found."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => id && loadDetails(id)}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const listColor = customList.color ?? "#2563EB";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>‹ Back</Text>
              </Pressable>

              <View
                style={[
                  styles.listIconContainer,
                  { backgroundColor: `${listColor}18` },
                ]}
              >
                <Text style={styles.listIcon}>
                  {customList.icon || "☷"}
                </Text>
              </View>

              {/* <Text style={styles.title}>{customList.name}</Text>

              <Text style={styles.subtitle}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </Text> */}

              <Text style={styles.title}>{customList.name}</Text>

              <Text style={styles.subtitle}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </Text>

              <Pressable
                style={styles.editButton}
                onPress={() => router.push(`/custom-lists/${id}/edit`)}
              >
                <Text style={styles.editButtonText}>✏️ Edit list</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>

              <Pressable
                style={styles.addButton}
                onPress={() =>
                  router.push(`/custom-lists/${id}/add-items`)
                }
              >
                <Text style={styles.addButtonText}>+ Add items</Text>
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyDescription}>
              Add existing items from your collections to this list.
            </Text>
          </View>
        }

        ListFooterComponent={
            <Pressable
                style={styles.deleteButton}
                onPress={handleDeleteList}
                disabled={isSaving}
            >
                <Text style={styles.deleteButtonText}>
                {isSaving ? "Deleting..." : "Delete List"}
                </Text>
            </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    marginBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },
  listIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  listIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  itemIconText: {
    fontSize: 22,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  collectionName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
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

  editButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
  },
  editButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  deleteButton: {
    marginTop: 32,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
    deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
});
