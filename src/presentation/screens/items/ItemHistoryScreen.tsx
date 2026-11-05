
import { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { ItemHistoryType } from "../../../database/models/ItemHistory";
import { useItemHistoryStore } from "../../../database/stores/items/ItemHistoryStore";

interface ItemHistoryScreenProps {
  itemId: string;
}

const HISTORY_CONFIG: Record<
  ItemHistoryType,
  { label: string; icon: string; color: string; background: string }
> = {
  CREATED: {
    label: "Item created",
    icon: "✦",
    color: "#2563EB",
    background: "#DBEAFE",
  },
  UPDATED: {
    label: "Item updated",
    icon: "✎",
    color: "#7C3AED",
    background: "#EDE9FE",
  },
  PURCHASED: {
    label: "Item purchased",
    icon: "＋",
    color: "#059669",
    background: "#D1FAE5",
  },
  SOLD: {
    label: "Item sold",
    icon: "✓",
    color: "#059669",
    background: "#D1FAE5",
  },
  LENT: {
    label: "Item lent",
    icon: "↗",
    color: "#D97706",
    background: "#FEF3C7",
  },
  BORROWED: {
    label: "Item borrowed",
    icon: "↙",
    color: "#D97706",
    background: "#FEF3C7",
  },
  RESTORED: {
    label: "Item restored",
    icon: "↻",
    color: "#059669",
    background: "#D1FAE5",
  },
  DELETED: {
    label: "Item deleted",
    icon: "×",
    color: "#DC2626",
    background: "#FEE2E2",
  },
  CUSTOM: {
    label: "Custom activity",
    icon: "•",
    color: "#64748B",
    background: "#F1F5F9",
  },
};

function formatHistoryDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHistoryTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ItemHistoryScreen({
  itemId,
}: ItemHistoryScreenProps) {
  const history = useItemHistoryStore(
    (state) => state.history
  );

  const isLoading = useItemHistoryStore(
    (state) => state.isLoading
  );

  const error = useItemHistoryStore(
    (state) => state.error
  );

  const loadHistory = useItemHistoryStore(
    (state) => state.loadHistory
  );

  const clearHistory = useItemHistoryStore(
    (state) => state.clearHistory
  );

  useEffect(() => {
    loadHistory(itemId);

    return () => {
      clearHistory();
    };
  }, [itemId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.statusText}>
          Loading history...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to load history
        </Text>

        <Text style={styles.statusText}>{error}</Text>

        <Text
          style={styles.retryButton}
          onPress={() => loadHistory(itemId)}
        >
          Try again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={styles.backButton}
          onPress={() => router.back()}
        >
          ‹ Back
        </Text>

        <Text style={styles.headerTitle}>
          Item History
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>
            Activity Timeline
          </Text>

          <Text style={styles.subtitle}>
            Track everything that has happened to this item.
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>◷</Text>

            <Text style={styles.emptyTitle}>
              No history yet
            </Text>

            <Text style={styles.emptyDescription}>
              Activities related to this item will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {history.map((entry, index) => {
              const config = HISTORY_CONFIG[entry.type];
              const isLast = index === history.length - 1;

              return (
                <View key={entry.id} style={styles.timelineRow}>
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: config.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.eventIcon,
                          { color: config.color },
                        ]}
                      >
                        {config.icon}
                      </Text>
                    </View>

                    {!isLast && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.eventTitle}>
                        {config.label}
                      </Text>

                      <Text style={styles.eventTime}>
                        {formatHistoryTime(entry.createdAt)}
                      </Text>
                    </View>

                    {entry.description && (
                      <Text style={styles.eventDescription}>
                        {entry.description}
                      </Text>
                    )}

                    <Text style={styles.eventDate}>
                      {formatHistoryDate(entry.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
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
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  intro: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  timelineIndicator: {
    width: 48,
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  eventIcon: {
    fontSize: 19,
    fontWeight: "700",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: "#E2E8F0",
  },
  historyCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  eventTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  eventDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 19,
  },
  eventDate: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyIcon: {
    fontSize: 36,
    color: "#94A3B8",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
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
    color: "#64748B",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
  },
  retryButton: {
    marginTop: 20,
    color: "#2563EB",
    fontWeight: "600",
  },
});
