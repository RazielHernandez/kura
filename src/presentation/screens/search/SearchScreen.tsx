import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSearchStore } from "../../../database/stores/search/SearchStore";

const MATCH_LABELS: Record<string, string> = {
  name: "Name",
  item: "Name",
  description: "Description",
  customField: "Custom field",
  tag: "Tag",
  note: "Note",
};

function MatchIndicators({ matches }: { matches: string[] }) {
  return (
    <View style={styles.matchContainer}>
      {matches.map((match) => (
        <View key={match} style={styles.matchBadge}>
          <Text style={styles.matchText}>
            {MATCH_LABELS[match] ?? match}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function SearchScreen() {
  const query = useSearchStore((state) => state.query);
  const results = useSearchStore((state) => state.results);
  const isLoading = useSearchStore((state) => state.isLoading);
  const error = useSearchStore((state) => state.error);

  const setQuery = useSearchStore((state) => state.setQuery);
  const search = useSearchStore((state) => state.search);
  const insets = useSafeAreaInsets();

  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    const timeout = setTimeout(() => {
      setIsDebouncing(false);
      search(normalizedQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, search]);

  const hasResults =
    results.collections.length > 0 || results.items.length > 0;

  const handleOpenCollection = (collectionId: string) => {
    router.push(`/collections/${collectionId}`);
  };

  const handleOpenItem = (
    collectionId: string,
    itemId: string
  ) => {
    router.push(`/collections/${collectionId}/items/${itemId}`);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>
          Find collections, items, tags and notes.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={21}
          color="#64748B"
        />

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search your collections..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search collections and items"
          accessibilityHint="Search by name, description, custom field, tag, or note"
        />

        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!query.trim() ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="search-outline"
                size={34}
                color="#2563EB"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Search your items
            </Text>

            <Text style={styles.emptyDescription}>
              Search by item name, description, custom field,
              tag or note.
            </Text>
          </View>
        ) : isDebouncing || isLoading ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.statusText}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.statusContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color="#DC2626"
            />
            <Text style={styles.errorTitle}>
              Unable to search
            </Text>
            <Text style={styles.statusText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => search(query)}
            >
              <Text style={styles.retryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="file-tray-outline"
                size={34}
                color="#64748B"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No results found
            </Text>

            <Text style={styles.emptyDescription}>
              Try another search term.
            </Text>
          </View>
        ) : (
          <>
            {results.collections.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Collections
                  </Text>
                  <Text style={styles.count}>
                    {results.collections.length}
                  </Text>
                </View>

                {results.collections.map((collection) => (
                  <Pressable
                    key={collection.collectionId}
                    style={styles.resultCard}
                    onPress={() =>
                      handleOpenCollection(collection.collectionId)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open collection ${collection.collectionName}`}
                  >
                    <View style={styles.collectionIcon}>
                      <Ionicons
                        name="albums-outline"
                        size={21}
                        color="#2563EB"
                      />
                    </View>

                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>
                        {collection.collectionName}
                      </Text>

                      {collection.description ? (
                        <Text
                          style={styles.resultDescription}
                          numberOfLines={2}
                        >
                          {collection.description}
                        </Text>
                      ) : null}

                      <MatchIndicators
                        matches={[collection.matchedBy]}
                      />
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color="#94A3B8"
                    />
                  </Pressable>
                ))}
              </View>
            )}

            {results.items.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Items
                  </Text>
                  <Text style={styles.count}>
                    {results.items.length}
                  </Text>
                </View>

                {results.items.map((item) => (
                  <Pressable
                    key={item.itemId}
                    style={styles.resultCard}
                    onPress={() =>
                      handleOpenItem(item.collectionId, item.itemId)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open item ${item.itemName} in ${item.collectionName}`}
                  >
                    <View style={styles.itemIcon}>
                      <Ionicons
                        name="cube-outline"
                        size={21}
                        color="#64748B"
                      />
                    </View>

                    <View style={styles.resultInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text
                          style={styles.resultTitle}
                          numberOfLines={1}
                        >
                          {item.itemName}
                        </Text>

                        {item.favorite && (
                          <Ionicons
                            name="star"
                            size={15}
                            color="#F59E0B"
                          />
                        )}
                      </View>

                      <Text
                        style={styles.collectionName}
                        numberOfLines={1}
                      >
                        {item.collectionName}
                      </Text>

                      <MatchIndicators matches={item.matchedBy} />
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color="#94A3B8"
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </>
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
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },
  searchContainer: {
    height: 52,
    marginHorizontal: 24,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 0,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  collectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  resultDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  collectionName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  matchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  matchBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  statusContainer: {
    flex: 1,
    minHeight: 260,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 10,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
