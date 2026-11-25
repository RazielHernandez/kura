import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFavoritesStore } from "../../../database/stores/favorites/favoritesStore";
import { ItemWithCollection } from "../../../database/models/Item";

function FavoriteItemRow({
  item,
}: {
  item: ItemWithCollection;
}) {
  const color = item.collectionColor ?? "#2563EB";
  const icon = item.collectionIcon ?? "📦";

  return (
    <Pressable
      style={styles.itemCard}
      onPress={() =>
        router.push(
          `/collections/${item.collectionId}/items/${item.id}`
        )
      }
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name} in ${item.collectionName}`}
    >
      <View
        style={[
          styles.itemIcon,
          { backgroundColor: `${color}20` },
        ]}
      >
        <Text style={styles.itemEmoji}>{icon}</Text>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.collectionName} numberOfLines={1}>
          {item.collectionName}
        </Text>
      </View>

      <Ionicons name="star" size={18} color="#F59E0B" />

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  const items = useFavoritesStore((state) => state.items);
  const isLoading = useFavoritesStore((state) => state.isLoading);
  const error = useFavoritesStore((state) => state.error);
  const loadFavorites = useFavoritesStore(
    (state) => state.loadFavorites
  );

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  if (items.length === 0 && isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.statusText}>
          Loading your favorites...
        </Text>
      </View>
    );
  }

  if (items.length === 0 && error) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#DC2626"
        />

        <Text style={styles.errorTitle}>
          Unable to load favorites
        </Text>

        <Text style={styles.statusText}>{error}</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={loadFavorites}
        >
          <Text style={styles.primaryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadFavorites}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="star"
              size={25}
              color="#F59E0B"
            />
          </View>

          <Text style={styles.title}>Favorites</Text>

          <Text style={styles.subtitle}>
            All the things you love, in one place.
          </Text>
        </View>

        {error && (
          <Pressable
            style={styles.errorBanner}
            onPress={loadFavorites}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />
            <Text style={styles.errorBannerText}>
              Couldn't refresh favorites. Tap to retry.
            </Text>
          </Pressable>
        )}

        {items.length > 0 ? (
          <>
            <Text style={styles.resultCount}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </Text>

            {items.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="star-outline"
                size={34}
                color="#F59E0B"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No favorites yet
            </Text>

            <Text style={styles.emptyDescription}>
              Mark items as favorites to find them quickly here.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/collections")}
            >
              <Text style={styles.primaryButtonText}>
                Explore Collections
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    marginBottom: 28,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 14,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: {
    fontSize: 23,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  collectionName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 45,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  statusText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    gap: 9,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#B91C1C",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
