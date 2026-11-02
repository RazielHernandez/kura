import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { databaseService } from "../src/database/DatabaseService";

type AppStatus = "loading" | "ready" | "error";

export default function RootLayout() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async () => {
    try {
      setStatus("loading");
      setError(null);

      await databaseService.initialize();

      setStatus("ready");
    } catch (err) {
      console.error("Database initialization failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to initialize the database."
      );

      setStatus("error");
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Initializing Kura...</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error}</Text>
        <Text onPress={initializeDatabase} style={styles.retry}>
          Try again
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  retry: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
  },
});
