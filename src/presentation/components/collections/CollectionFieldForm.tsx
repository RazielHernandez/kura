
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { FieldType } from "../../../database/models/CollectionField";
import { DraftCollectionField } from "../../screens/collections/CreateCollectionScreen";

const FIELD_TYPES: FieldType[] = [
  "TEXT",
  "NUMBER",
  "DECIMAL",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "EMAIL",
  "PHONE",
  "URL",
  "COLOR",
  "RATING",
];

interface CollectionFieldFormProps {
  visible: boolean;
  initialField: DraftCollectionField | null;
  onCancel: () => void;
  onSave: (field: Omit<DraftCollectionField, "id">) => void;
}

export function CollectionFieldForm({
  visible,
  initialField,
  onCancel,
  onSave,
}: CollectionFieldFormProps) {
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialField?.name ?? "");
      setFieldType(initialField?.fieldType ?? "TEXT");
      setRequired(initialField?.required ?? false);
    }
  }, [visible, initialField]);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      fieldType,
      required,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialField ? "Edit Field" : "New Field"}
            </Text>

            <Pressable onPress={onCancel}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Field name *</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Platform"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={60}
            />

            <Text style={styles.label}>Field type</Text>

            <View style={styles.typeList}>
              {FIELD_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeOption,
                    fieldType === type && styles.selectedType,
                  ]}
                  onPress={() => setFieldType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      fieldType === type && styles.selectedTypeText,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.requiredRow}>
              <View>
                <Text style={styles.requiredTitle}>Required field</Text>
                <Text style={styles.requiredHint}>
                  Users must provide this value.
                </Text>
              </View>

              <Switch
                value={required}
                onValueChange={setRequired}
                trackColor={{ true: "#2563EB" }}
              />
            </View>

            <Pressable
              style={[
                styles.saveButton,
                !name.trim() && styles.disabledButton,
              ]}
              disabled={!name.trim()}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                {initialField ? "Update Field" : "Add Field"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  cancel: {
    color: "#64748B",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  typeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  selectedType: {
    backgroundColor: "#2563EB",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  selectedTypeText: {
    color: "#FFFFFF",
  },
  requiredRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requiredTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  requiredHint: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.4,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
