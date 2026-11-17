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

import { Collection } from "../../../database/models/Collection";
import { collectionRepository } from "../../../database/repositories/CollectionRepository";
import { useCollectionStore } from "../../../database/stores/collections/collectionStore";

export function DeletedCollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const restoreCollection = useCollectionStore(
    (state) => state.restoreCollection
  );

  const loadDeletedCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deleted =
        await collectionRepository.getDeletedOrdered();

      setCollections(deleted);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load deleted collections."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedCollections();
  }, [loadDeletedCollections]);

  const handleRestore = (collection: Collection) => {
    Alert.alert(
      "Restore Collection",
      `Restore "${collection.name}" and its deleted items?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          onPress: async () => {
            setRestoringId(collection.id);

            try {
              await restoreCollection(collection.id);
              await loadDeletedCollections();
            } catch (error) {
              Alert.alert(
                "Unable to Restore Collection",
                error instanceof Error
                  ? error.message
                  : "Something went wrong while restoring the collection."
              );
            } finally {
              setRestoringId(null);
            }
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

        <Text style={styles.title}>Deleted Collections</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>
            Loading deleted collections...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={loadDeletedCollections}
          >
            <Text style={styles.primaryButtonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗑️</Text>

          <Text style={styles.emptyTitle}>
            No deleted collections
          </Text>

          <Text style={styles.statusText}>
            Collections you delete will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isRestoring = restoringId === item.id;
            const isDisabled = restoringId !== null;

            return (
              <View style={styles.collectionCard}>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionIcon}>
                    {item.icon ?? "📦"}
                  </Text>

                  <View style={styles.collectionDetails}>
                    <Text style={styles.collectionName}>
                      {item.name}
                    </Text>

                    {item.description ? (
                      <Text style={styles.description}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.restoreButton,
                    isDisabled && styles.disabledButton,
                  ]}
                  disabled={isDisabled}
                  onPress={() => handleRestore(item)}
                >
                  {isRestoring ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text style={styles.restoreButtonText}>
                      Restore
                    </Text>
                  )}
                </Pressable>
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
  collectionCard: {
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
  collectionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  collectionIcon: {
    fontSize: 28,
  },
  collectionDetails: {
    flex: 1,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  description: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
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
});