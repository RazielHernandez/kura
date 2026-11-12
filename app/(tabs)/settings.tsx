
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { repairItemThumbnailsWorkflow } from "../../src/database/usecases/workflow/images/RepairItemThumbnailsWorkflow";
import { validateItemImagesWorkflow } from "../../src/database/usecases/workflow/images/ValidateItemImagesWorkflow";

export default function SettingsScreen() {
  const [isRepairing, setIsRepairing] = useState(false);

  const handleRepairThumbnails = async () => {
    try {
      setIsRepairing(true);

      const result =
        await repairItemThumbnailsWorkflow.execute();

      console.log("Thumbnail repair completed:", result);

      Alert.alert(
        "Thumbnail Repair",
        `Repaired: ${result.repaired}\n` +
          `Skipped: ${result.skipped}\n` +
          `Failed: ${result.failed}`
      );
    } catch (error) {
      Alert.alert(
        "Thumbnail Repair",
        error instanceof Error
          ? error.message
          : "Unable to repair thumbnails."
      );
    } finally {
      setIsRepairing(false);
    }
  };

  const handleValidateImages = async () => {
    try {
        const result = await validateItemImagesWorkflow.execute();

        console.log("Image integrity validation:", result);

        Alert.alert(
        "Image Integrity",
        `Valid images: ${result.valid}\n` +
            `Missing originals: ${result.missingOriginal}\n` +
            `Skipped: ${result.skipped}\n` +
            `Failed: ${result.failed}`
        );
    } catch (error) {
        Alert.alert(
        "Image Integrity",
        error instanceof Error
            ? error.message
            : "Unable to validate images."
        );
    }
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Image Storage
        </Text>

        <Text style={styles.description}>
          Repair missing thumbnails for your saved item images.
        </Text>

        {isRepairing ? (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text>Repairing thumbnails...</Text>
          </View>
        ) : (
          <Button
            title="Repair Image Thumbnails"
            onPress={handleRepairThumbnails}
          />
        )}

        <Button
            title="Check Image Integrity"
            onPress={handleValidateImages}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
