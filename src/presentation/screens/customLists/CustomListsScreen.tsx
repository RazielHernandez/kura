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
import { useCustomListStore } from "../../../database/stores/customLists/customListStore";
import { CustomList } from "../../../database/models/CustomList";

export function CustomListsScreen() {
  const {
    customLists,
    isLoading,
    error,
    loadCustomLists,
  } = useCustomListStore();

  useEffect(() => {
    loadCustomLists();
  }, [loadCustomLists]);

  const renderList = ({ item }: { item: CustomList }) => {
    const iconColor = item.color ?? "#2563EB";

    return (
      <Pressable
        style={styles.listCard}
        onPress={() => router.push(`/custom-lists/${item.id}`)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}18` },
          ]}
        >
          <Text style={[styles.listIcon, { color: iconColor }]}>
            {item.icon || "☷"}
          </Text>
        </View>

        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listSubtitle}>Custom list</Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Lists</Text>
          <Text style={styles.subtitle}>
            Organize your items into custom lists
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/custom-lists/new")}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={loadCustomLists}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : customLists.length === 0 ? (
        <View style={styles.centeredState}>
          <Text style={styles.emptyIcon}>☷</Text>
          <Text style={styles.emptyTitle}>No lists yet</Text>
          <Text style={styles.emptyDescription}>
            Create your first list to organize items from your collections.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/custom-lists/new")}
          >
            <Text style={styles.emptyButtonText}>Create your first list</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={customLists}
          keyExtractor={(item) => item.id}
          renderItem={renderList}
          contentContainerStyle={styles.listContent}
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
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  listIcon: {
    fontSize: 23,
    fontWeight: "600",
  },
  listInfo: {
    flex: 1,
    marginLeft: 14,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  listSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  chevron: {
    fontSize: 26,
    color: "#94A3B8",
    marginLeft: 8,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 42,
    color: "#94A3B8",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
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
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 22,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
