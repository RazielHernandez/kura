
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { DraftCollectionField } from "../../screens/collections/CreateCollectionScreen";

interface CollectionFieldListProps {
  fields: DraftCollectionField[];
  onEdit: (field: DraftCollectionField) => void;
  onDelete: (id: string) => void;
}

export function CollectionFieldList({
  fields,
  onEdit,
  onDelete,
}: CollectionFieldListProps) {
  if (fields.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No custom fields added.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View key={field.id} style={styles.card}>
          <View style={styles.order}>
            <Text style={styles.orderText}>{index + 1}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.name}>{field.name}</Text>

            <Text style={styles.type}>
              {field.fieldType}
              {field.required ? " · Required" : ""}
            </Text>
          </View>

          <Pressable
            style={styles.action}
            onPress={() => onEdit(field)}
          >
            <Text style={styles.edit}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.action}
            onPress={() => onDelete(field.id)}
          >
            <Text style={styles.delete}>×</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  empty: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  order: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  orderText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  type: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  action: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  edit: {
    color: "#2563EB",
    fontWeight: "600",
  },
  delete: {
    fontSize: 22,
    color: "#DC2626",
  },
});
