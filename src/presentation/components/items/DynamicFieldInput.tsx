import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  StyleSheet,
} from "react-native";

import { CollectionField } from "../../../database/models/CollectionField";

interface DynamicFieldInputProps {
  field: CollectionField;
  value: string | null;
  onChange: (value: string | null) => void;
}

const COLORS = [
  "#E53935",
  "#FB8C00",
  "#FDD835",
  "#43A047",
  "#00897B",
  "#1E88E5",
  "#3949AB",
  "#8E24AA",
  "#D81B60",
  "#795548",
  "#607D8B",
  "#212121",
];

export function DynamicFieldInput({
  field,
  value,
  onChange,
}: DynamicFieldInputProps) {
  const label = (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{field.name}</Text>

      {field.required && (
        <Text style={styles.required}>*</Text>
      )}
    </View>
  );

  const commonInputProps = {
    value: value ?? "",
    onChangeText: onChange,
    placeholder: `Enter ${field.name.toLowerCase()}`,
    placeholderTextColor: "#9CA3AF",
    style: styles.input,
  };

  const renderInput = () => {
    switch (field.fieldType) {
      case "TEXT":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="default"
            autoCapitalize="sentences"
          />
        );

      case "NUMBER":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="numeric"
          />
        );

      case "DECIMAL":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="decimal-pad"
          />
        );

      case "EMAIL":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case "PHONE":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="phone-pad"
          />
        );

      case "URL":
        return (
          <TextInput
            {...commonInputProps}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case "DATE":
        return (
          <TextInput
            {...commonInputProps}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />
        );

      case "DATETIME":
        return (
          <TextInput
            {...commonInputProps}
            placeholder="YYYY-MM-DDTHH:mm"
            autoCapitalize="none"
          />
        );

      case "BOOLEAN":
        return (
          <View style={styles.switchContainer}>
            <Text style={styles.switchValue}>
              {value === "true" ? "Yes" : "No"}
            </Text>

            <Switch
              value={value === "true"}
              onValueChange={(checked) =>
                onChange(checked ? "true" : "false")
              }
            />
          </View>
        );

      case "COLOR":
        return (
          <View style={styles.colorContainer}>
            {COLORS.map((color) => {
              const selected = value === color;

              return (
                <Pressable
                  key={color}
                  onPress={() => onChange(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selected && styles.selectedColor,
                  ]}
                />
              );
            })}
          </View>
        );

      case "RATING":
        return (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const selected =
                Number(value ?? 0) >= rating;

              return (
                <Pressable
                  key={rating}
                  onPress={() =>
                    onChange(
                      selected && Number(value) === rating
                        ? null
                        : String(rating)
                    )
                  }
                >
                  <Text
                    style={[
                      styles.star,
                      selected && styles.selectedStar,
                    ]}
                  >
                    ★
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );

      default:
        return (
          <Text style={styles.unsupported}>
            Unsupported field type
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {label}
      <View style={styles.inputContainer}>
        {renderInput()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 18,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  required: {
    color: "#E53935",
    fontSize: 14,
  },
  inputContainer: {
    minHeight: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    minHeight: 46,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 46,
  },
  switchValue: {
    fontSize: 14,
    color: "#374151",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#111827",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 6,
  },
  star: {
    fontSize: 30,
    color: "#D1D5DB",
  },
  selectedStar: {
    color: "#F59E0B",
  },
  unsupported: {
    color: "#DC2626",
    fontSize: 13,
  },
});
