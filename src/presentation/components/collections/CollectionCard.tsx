
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Collection } from "../../../database/models/Collection";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({
  collection,
}: CollectionCardProps) {
  const color = collection.color ?? "#2563EB";

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        // We'll navigate to collection details later.
      }}
    >
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

      <View style={styles.content}>
        <Text style={styles.name}>{collection.name}</Text>

        {collection.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {collection.description}
          </Text>
        ) : (
          <Text style={styles.description}>
            Your collection
          </Text>
        )}
      </View>

      <View
        style={[styles.colorIndicator, { backgroundColor: color }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 25,
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  colorIndicator: {
    width: 5,
    height: 36,
    borderRadius: 5,
    marginLeft: 12,
  },
});
