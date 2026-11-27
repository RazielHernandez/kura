import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { CustomList } from "../../../database/models/CustomList";
import { customListRepository } from "../../../database/repositories/CustomListRepository";
import { useCustomListStore } from "../../../database/stores/customLists/customListStore";

export function DeletedCustomListsScreen() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const restoreCustomList = useCustomListStore(
    (state) => state.restoreCustomList
  );

  const permanentlyDeleteCustomList = useCustomListStore(
    (state) => state.permanentlyDeleteCustomList
  );

  const loadDeletedLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deleted = await customListRepository.getDeletedOrdered();
      setLists(deleted);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load deleted custom lists."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedLists();
  }, [loadDeletedLists]);

  const handleRestore = (list: CustomList) => {
    Alert.alert(
      "Restore Custom List",
      `Restore "${list.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            setRestoringId(list.id);

            try {
              await restoreCustomList(list.id);
              await loadDeletedLists();
            } catch (error) {
                const message =
                    error instanceof Error
                    ? error.message
                    : "Something went wrong while restoring the list.";

                useCustomListStore.getState().clearError();

                Alert.alert(
                    "Unable to Restore Custom List",
                    message
                );
            } finally {
                setRestoringId(null);
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (list: CustomList) => {
    Alert.alert(
      "Permanently Delete Custom List",
      `Are you sure you want to permanently delete "${list.name}"?\n\nThis will permanently remove the list and its item associations. The items themselves will not be deleted. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            setDeletingId(list.id);

            try {
              await permanentlyDeleteCustomList(list.id);
              await loadDeletedLists();
            } catch (error) {
              Alert.alert(
                "Unable to Delete Custom List",
                error instanceof Error
                  ? error.message
                  : "Something went wrong while permanently deleting the list."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const isBusy = restoringId !== null || deletingId !== null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Deleted Custom Lists</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>
            Loading deleted custom lists...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={loadDeletedLists}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗑️</Text>
          <Text style={styles.emptyTitle}>No deleted custom lists</Text>
          <Text style={styles.statusText}>
            Custom lists you delete will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isRestoring = restoringId === item.id;
            const isDeleting = deletingId === item.id;

            return (
              <View style={styles.listCard}>
                <View style={styles.listInfo}>
                  <Text style={styles.listIcon}>
                    {item.icon ?? "📚"}
                  </Text>

                  <View style={styles.listDetails}>
                    <Text style={styles.listName}>{item.name}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={[
                      styles.restoreButton,
                      isBusy && styles.disabledButton,
                    ]}
                    disabled={isBusy}
                    onPress={() => handleRestore(item)}
                  >
                    {isRestoring ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.restoreButtonText}>Restore</Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={[
                      styles.deleteButton,
                      isBusy && styles.disabledButton,
                    ]}
                    disabled={isBusy}
                    onPress={() => handlePermanentDelete(item)}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  statusText: {
    marginTop: 12,
    color: "#64748B",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listIcon: {
    fontSize: 28,
  },
  listDetails: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  restoreButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 76,
    alignItems: "center",
  },
  restoreButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 76,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
