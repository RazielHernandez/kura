
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useCollectionStore } from "../../../database/stores/collections/collectionStore";
import { CollectionCard } from "../../components/collections/CollectionCard";

export function CollectionsScreen() {
  const collections = useCollectionStore(
    (state) => state.collections
  );

  const isLoading = useCollectionStore(
    (state) => state.isLoading
  );

  const error = useCollectionStore(
    (state) => state.error
  );

  const loadCollections = useCollectionStore(
    (state) => state.loadCollections
  );

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Collections</Text>
          <Text style={styles.subtitle}>
            Organize the things you love
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/collections/new")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {isLoading && collections.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>
            Loading collections...
          </Text>
        </View>
      ) : error && collections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadCollections()}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>
            No collections yet
          </Text>
          <Text style={styles.statusText}>
            Create your first collection to get started.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/collections/new")}
          >
            <Text style={styles.primaryButtonText}>
              Create Collection
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionCard collection={item} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
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
  retryButton: {
    marginTop: 16,
    padding: 12,
  },
  retryText: {
    color: "#2563EB",
    fontWeight: "600",
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
    marginTop: 24,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
