
import { useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useCollectionDetailsStore } from "../../../database/stores/collections/CollectionDetailsStore";

interface CollectionDetailsScreenProps {
  collectionId: string;
}

export function CollectionDetailsScreen({
  collectionId,
}: CollectionDetailsScreenProps) {
  const collection = useCollectionDetailsStore(
    (state) => state.collection
  );

  const fields = useCollectionDetailsStore(
    (state) => state.fields
  );

  const items = useCollectionDetailsStore(
    (state) => state.items
  );

  const isLoading = useCollectionDetailsStore(
    (state) => state.isLoading
  );

  const error = useCollectionDetailsStore(
    (state) => state.error
  );

  const loadDetails = useCollectionDetailsStore(
    (state) => state.loadDetails
  );

  const clearDetails = useCollectionDetailsStore(
    (state) => state.clearDetails
  );

  useFocusEffect(
    useCallback(() => {
      loadDetails(collectionId);
    }, [collectionId])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.statusText}>Loading collection...</Text>
      </View>
    );
  }

  if (error || !collection) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to load collection
        </Text>

        <Text style={styles.statusText}>
          {error ?? "Collection not found."}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => loadDetails(collectionId)}
        >
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const color = collection.color ?? "#2563EB";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            
          }}
        >
          <Text style={styles.headerAction}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${color}20` },
            ]}
          >
            <Text style={styles.icon}>
              {collection.icon ?? "📦"}
            </Text>
          </View>

          <Text style={styles.title}>{collection.name}</Text>

          {collection.description ? (
            <Text style={styles.description}>
              {collection.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Fields</Text>

          <Text style={styles.count}>
            {fields.length}
          </Text>
        </View>

        {fields.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No custom fields
            </Text>
            <Text style={styles.emptyText}>
              This collection doesn't have any custom fields.
            </Text>
          </View>
        ) : (
          <View style={styles.fieldsContainer}>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.fieldCard}>
                <View style={styles.fieldOrder}>
                  <Text style={styles.fieldOrderText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.fieldContent}>
                  <Text style={styles.fieldName}>
                    {field.name}
                  </Text>

                  <Text style={styles.fieldType}>
                    {field.fieldType}
                  </Text>
                </View>

                {field.required ? (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>
                      Required
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={styles.tagsSection}>
          <View>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.tagsDescription}>
              Organize your items with custom tags.
            </Text>
          </View>

          <Pressable
            style={styles.manageTagsButton}
            onPress={() =>
              router.push(`/collections/${collectionId}/tags`)
            }
          >
            <Text style={styles.manageTagsButtonText}>
              Manage Tags
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.itemsSection}>
          
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>
              Items ({items.length})
            </Text>

            <View style={styles.itemsActions}>
              <Pressable
                onPress={() =>
                  router.push(
                    `/collections/${collectionId}/deleted-items`
                  )
                }
              >
                <Text style={styles.deletedItemsText}>
                  Deleted
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push(
                    `/collections/${collectionId}/items/new`
                  )
                }
              >
                <Text style={styles.addItemText}>
                  + Add Item
                </Text>
              </Pressable>
            </View>
          </View>


          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsText}>
                No items yet
              </Text>

              <Text style={styles.emptyItemsDescription}>
                Start adding items to this collection.
              </Text>
            </View>
          ) : (
            
            items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push(
                    `/collections/${collectionId}/items/${item.id}`
                  )
                }
              >
                <View style={styles.itemCard}>
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

                  {item.favorite && (
                    <Text style={styles.favoriteIcon}>★</Text>
                  )}
                </View>
              </Pressable>
            ))

          )}
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
  },
  header: {
    paddingHorizontal: 24,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },
  headerAction: {
    color: "#2563EB",
    fontWeight: "600",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  collectionHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fieldsContainer: {
    gap: 10,
  },
  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fieldOrder: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldOrderText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  fieldContent: {
    flex: 1,
    marginLeft: 12,
  },
  fieldName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  fieldType: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  requiredBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  statusText: {
    marginTop: 12,
    textAlign: "center",
    color: "#64748B",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
  },
  backText: {
    color: "#2563EB",
    marginTop: 20,
  },

  tagsSection: {
    marginTop: 28,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tagsDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },

  manageTagsButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  manageTagsButtonText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  itemsSection: {
    marginTop: 24,
  },

  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  addItemText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  emptyItems: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },

  emptyItemsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  emptyItemsDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  itemDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  favoriteIcon: {
    fontSize: 20,
    color: "#F59E0B",
    marginLeft: 12,
  },

  itemsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  deletedItemsText: {
    color: "#64748B",
    fontWeight: "600",
  },
});
