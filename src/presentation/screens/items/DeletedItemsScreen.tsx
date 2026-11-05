
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { Item } from "../../../database/models/Item";
import { itemRepository } from "../../../database/repositories/ItemRepository";
import { useItemStore } from "../../../database/stores/items/ItemStore";

interface DeletedItemsScreenProps {
  collectionId: string;
}

export function DeletedItemsScreen({
  collectionId,
}: DeletedItemsScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const restoreItem = useItemStore(
    (state) => state.restoreItem
  );

  const storeError = useItemStore(
    (state) => state.error
  );

  const clearStoreError = useItemStore(
    (state) => state.clearError
  );

  const loadDeletedItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deletedItems =
        await itemRepository.getDeletedByCollectionId(collectionId);

      setItems(deletedItems);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load deleted items."
      );
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadDeletedItems();
  }, [loadDeletedItems]);

  const handleRestore = (item: Item) => {
    Alert.alert(
      "Restore Item",
      `Restore "${item.name}" to this collection?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          onPress: async () => {
            setRestoringId(item.id);
            clearStoreError();

            const success = await restoreItem(item.id);

            if (success) {
              await loadDeletedItems();
            }

            setRestoringId(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Deleted Items</Text>

        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>
            Loading deleted items...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={loadDeletedItems}
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗑️</Text>
          <Text style={styles.emptyTitle}>
            No deleted items
          </Text>
          <Text style={styles.emptyDescription}>
            Items you delete from this collection will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            {items.length} deleted {items.length === 1 ? "item" : "items"}
          </Text>

          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.name}
                </Text>

                {item.description && (
                  <Text style={styles.itemDescription}>
                    {item.description}
                  </Text>
                )}
              </View>

              <Pressable
                style={[
                  styles.restoreButton,
                  restoringId === item.id && styles.disabledButton,
                ]}
                disabled={restoringId !== null}
                onPress={() => handleRestore(item)}
              >
                {restoringId === item.id ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <Text style={styles.restoreButtonText}>
                    Restore
                  </Text>
                )}
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {storeError && (
        <Text style={styles.errorText}>
          {storeError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
  },
  header: {
    height: 50,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },
  restoreButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  restoreButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: "#64748B",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    padding: 12,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
