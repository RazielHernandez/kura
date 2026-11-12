
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { repairItemThumbnailsWorkflow } from "../../src/database/usecases/workflow/images/RepairItemThumbnailsWorkflow";
import { validateItemImagesWorkflow } from "../../src/database/usecases/workflow/images/ValidateItemImagesWorkflow";
import { clearAllDataWorkflow } from "../../src/database/usecases/workflow/settings/ClearAllDataWorkflow";
import { resetAllStores } from "../../src/database/stores/settings/resetAllStores";

export default function SettingsScreen() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRepairThumbnails = async () => {
    try {
      setIsRepairing(true);

      const result = await repairItemThumbnailsWorkflow.execute();

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
        error instanceof Error ? error.message : "Unable to repair thumbnails."
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
        error instanceof Error ? error.message : "Unable to validate images."
      );
    }
  };

  const performDeleteAllData = async () => {
    try {
      setIsDeleting(true);

      const result = await clearAllDataWorkflow.execute();

      // Clear all in-memory Zustand state after database deletion.
      resetAllStores();

      console.log("Delete all data completed:", result);

      if (result.failedFiles > 0) {
        Alert.alert(
          "Data Cleared With Warnings",
          "Your database data was deleted, but some image files could not be removed.\n\n" +
            `Deleted files: ${result.deletedFiles}\n` +
            `Failed files: ${result.failedFiles}\n\n` +
            "Remaining files can be cleaned up later."
        );
      } else {
        Alert.alert(
          "All Data Deleted",
          "All collections, items, notes, tags, history, lists, and managed images have been deleted."
        );
      }
    } catch (error) {
      console.error("Delete all data failed:", error);

      Alert.alert(
        "Unable to Delete Data",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting your data."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllData = () => {
    if (isDeleting) return;

    Alert.alert(
      "Delete All Data?",
      "This action is permanent and cannot be undone.\n\n" +
        "All collections, items, custom fields, notes, tags, history, custom lists, and managed images will be deleted.\n\n" +
        "Your database structure and migrations will remain intact.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            void performDeleteAllData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image Storage</Text>

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

      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>

        <Text style={styles.description}>
          Permanently delete all application data stored on this device.
          This includes collections, items, notes, tags, history, and images.
        </Text>

        {isDeleting ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#DC2626" />
            <Text style={styles.dangerText}>
              Deleting all data...
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.deleteButton}
            onPress={handleDeleteAllData}
            accessibilityRole="button"
          >
            <Text style={styles.deleteButtonText}>
              Delete All Data
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
    gap: 20,
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
    lineHeight: 20,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dangerSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 12,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#B91C1C",
  },
  dangerText: {
    color: "#B91C1C",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
