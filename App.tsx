
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { databaseService } from "./src/database/DatabaseService";

type AppStatus = "loading" | "ready" | "error";

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const initializeApp = async () => {
    try {
      setStatus("loading");
      setError(null);

      await databaseService.initialize();

      setStatus("ready");
    } catch (error) {
      console.error("Application initialization failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong during initialization."
      );

      setStatus("error");
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Initializing Kura...</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Unable to start Kura
        </Text>

        <Text>{error}</Text>

        <Button
          title="Try again"
          onPress={initializeApp}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kura</Text>
      <Text>Database initialized successfully.</Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});


// import { useEffect, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// import { databaseService } from "./src/database/DatabaseService";
// import { CollectionRepository } from "./src/database/repositories/CollectionRepository"

// export default function App() {
//   const [databaseReady, setDatabaseReady] = useState(false);

//   useEffect(() => {
//     const initializeDatabase = async () => {
//       try {
//         await databaseService.initialize();
//         setDatabaseReady(true);
        
//       } catch (error) {
//         console.error("Database initialization failed:", error);
//       }
//     };

//     initializeDatabase();
//   }, []);

//   if (!databaseReady) {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
