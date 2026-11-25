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

import { useDashboardStore } from "../../../database/stores/dashboard/dashboardStore";
import { ItemWithCollection } from "../../../database/models/Item";

function DashboardItemRow({
  item,
}: {
  item: ItemWithCollection;
}) {
  const color = item.collectionColor ?? "#2563EB";
  const icon = item.collectionIcon ?? "📦";

  const handlePress = () => {
    router.push(
      `/collections/${item.collectionId}/items/${item.id}`
    );
  };

  return (
    <Pressable
      style={styles.itemCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name} in ${item.collectionName}`}
    >
      <View
        style={[
          styles.itemIcon,
          { backgroundColor: `${color}20` },
        ]}
      >
        <Text style={styles.itemEmoji}>
          {icon}
        </Text>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.collectionName} numberOfLines={1}>
          {item.collectionName}
        </Text>
      </View>

      {item.favorite && (
        <Ionicons
          name="star"
          size={16}
          color="#F59E0B"
        />
      )}

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

export function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const data = useDashboardStore((state) => state.data);
  const isLoading = useDashboardStore(
    (state) => state.isLoading
  );
  const error = useDashboardStore((state) => state.error);
  const loadDashboard = useDashboardStore(
    (state) => state.loadDashboard
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleCreateCollection = () => {
    router.push("/collections/new");
  };

  const handleOpenCollections = () => {
    router.push("/collections");
  };

  const handleOpenFavorites = () => {
    router.push("/favorites");
  };

  if (!data && isLoading) {
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
          Loading your Dashboard...
        </Text>
      </View>
    );
  }

  if (!data && error) {
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
          Unable to load Dashboard
        </Text>

        <Text style={styles.statusText}>{error}</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={loadDashboard}
        >
          <Text style={styles.primaryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!data) {
    return null;
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
            onRefresh={loadDashboard}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>
              Your personal collection space
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={handleCreateCollection}
            accessibilityRole="button"
            accessibilityLabel="Create collection"
          >
            <Ionicons
              name="add"
              size={27}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {error && (
          <Pressable
            style={styles.errorBanner}
            onPress={loadDashboard}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />
            <Text style={styles.errorBannerText}>
              Couldn't refresh Dashboard. Tap to retry.
            </Text>
          </Pressable>
        )}

        {/* Overview */}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconBlue}>
              <Ionicons
                name="albums-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statValue}>
              {data.collectionCount}
            </Text>

            <Text style={styles.statLabel}>
              Collections
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconPurple}>
              <Ionicons
                name="cube-outline"
                size={21}
                color="#7C3AED"
              />
            </View>

            <Text style={styles.statValue}>
              {data.itemCount}
            </Text>

            <Text style={styles.statLabel}>
              Items
            </Text>
          </View>
        </View>

        {/* Recent Items */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Recently updated
              </Text>
              <Text style={styles.sectionSubtitle}>
                Pick up where you left off
              </Text>
            </View>

            <Pressable
              onPress={handleOpenCollections}
              accessibilityRole="button"
              accessibilityLabel="View all collections"
            >
              <Text style={styles.seeAll}>Collections</Text>
            </Pressable>
          </View>

          {data.recentItems.length > 0 ? (
            data.recentItems.map((item) => (
              <DashboardItemRow
                key={item.id}
                item={item}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons
                name="time-outline"
                size={26}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>
                Your recently updated items will appear here.
              </Text>
            </View>
          )}
        </View>

        {/* Favorite Items */}

        <View style={styles.section}>

          {/* <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Favorites
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your favorite items
              </Text>
            </View>
          </View> */}

          <View style={styles.sectionHeader}>
            <View>
                <Text style={styles.sectionTitle}>
                Favorites
                </Text>
                <Text style={styles.sectionSubtitle}>
                Your favorite items
                </Text>
            </View>

            {data.favoriteItems.length > 0 && (
                <Pressable
                onPress={handleOpenFavorites}
                accessibilityRole="button"
                accessibilityLabel="View all favorite items"
                >
                <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            )}
          </View>

          {data.favoriteItems.length > 0 ? (
            data.favoriteItems.map((item) => (
              <DashboardItemRow
                key={item.id}
                item={item}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons
                name="star-outline"
                size={26}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>
                Items you mark as favorites will appear here.
              </Text>
            </View>
          )}
        </View>

        {/* Empty Dashboard */}

        {data.collectionCount === 0 && (
          <View style={styles.emptyDashboard}>
            <View style={styles.emptyDashboardIcon}>
              <Ionicons
                name="albums-outline"
                size={34}
                color="#2563EB"
              />
            </View>

            <Text style={styles.emptyDashboardTitle}>
              Start building your collections
            </Text>

            <Text style={styles.emptyDashboardDescription}>
              Create your first collection and start organizing
              the things you love.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={handleCreateCollection}
            >
              <Text style={styles.primaryButtonText}>
                Create Collection
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statIconPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
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
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemEmoji: {
    fontSize: 23,
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 22,
    alignItems: "center",
    gap: 9,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
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
  emptyDashboard: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    marginTop: 4,
  },
  emptyDashboardIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  emptyDashboardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptyDashboardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
});