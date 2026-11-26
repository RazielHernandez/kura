import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAddItemsStore } from "../../../database/stores/customLists/addItemsStore";
import { useSearchStore } from "../../../database/stores/search/SearchStore";
import { ItemWithCollection } from "../../../database/models/Item";

const ACTIVE_COLOR = "#2563EB";

export function AddItemsToListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    items,
    existingItemIds,
    isLoading,
    isSaving,
    error,
    loadItems,
    addItems,
    clearItems,
  } = useAddItemsStore();

  const {
    query,
    results,
    isLoading: isSearching,
    setQuery,
    search,
    clearSearch,
  } = useSearchStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadItems(id);
    }

    return () => {
      clearItems();
      clearSearch();
    };
  }, [id, loadItems, clearItems, clearSearch]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    const timeout = setTimeout(() => {
      search(normalizedQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, search]);

  const existingIds = useMemo(
    () => new Set(existingItemIds),
    [existingItemIds]
  );

  const searchResults = useMemo(
    () =>
      results.items.map((result) => ({
        id: result.itemId,
        name: result.itemName,
        collectionId: result.collectionId,
        collectionName: result.collectionName,
        favorite: result.favorite,
      })),
    [results.items]
  );

  const displayedItems = useMemo(() => {
    if (query.trim()) {
      return searchResults;
    }

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      collectionId: item.collectionId,
      collectionName: item.collectionName,
      favorite: item.favorite,
    }));
  }, [query, searchResults, items]);

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }, []);

  const handleAddItems = async () => {
    if (!id || selectedIds.length === 0) {
      return;
    }

    try {
      await addItems(id, selectedIds);
      Alert.alert(
        "Items added",
        `${selectedIds.length} item(s) added to your list.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", error ?? "Could not add the selected items.");
    }
  };

  const renderItem = ({ item }: { item: (typeof displayedItems)[number] }) => {
    const alreadyAdded = existingIds.has(item.id);
    const selected = selectedIds.includes(item.id);

    return (
      <Pressable
        style={styles.itemRow}
        onPress={() => !alreadyAdded && toggleSelection(item.id)}
        disabled={alreadyAdded}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.collectionName}>{item.collectionName}</Text>
        </View>

        {alreadyAdded ? (
          <Text style={styles.addedLabel}>Added</Text>
        ) : (
          <Ionicons
            name={selected ? "checkmark-circle" : "ellipse-outline"}
            size={25}
            color={selected ? ACTIVE_COLOR : "#8E8E93"}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </Pressable>

        <Text style={styles.title}>Add Items</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items across collections"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {query.length > 0 && (
          <Pressable onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </Pressable>
        )}
      </View>

      <View style={styles.selectionHeader}>
        <Text style={styles.sectionLabel}>
          {query.trim() ? "Search Results" : "All Items"}
        </Text>
        <Text style={styles.selectionCount}>
          {selectedIds.length} selected
        </Text>
      </View>

      {isLoading || isSearching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={ACTIVE_COLOR} />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : displayedItems.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="cube-outline" size={42} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>
            {query.trim() ? "No items found" : "No items available"}
          </Text>
          <Text style={styles.emptyDescription}>
            {query.trim()
              ? "Try another search term."
              : "Create some items in your collections first."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.addButton,
            (selectedIds.length === 0 || isSaving) &&
              styles.addButtonDisabled,
          ]}
          onPress={handleAddItems}
          disabled={selectedIds.length === 0 || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>
              Add {selectedIds.length > 0 ? selectedIds.length : ""} Items
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636366",
  },
  selectionCount: {
    fontSize: 13,
    color: ACTIVE_COLOR,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  collectionName: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
  addedLabel: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 6,
    textAlign: "center",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#D1D1D6",
  },
  addButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: ACTIVE_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});