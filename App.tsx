import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { databaseService } from "./src/database/DatabaseService";
import { CollectionRepository } from "./src/database/repositories/CollectionRepository"

export default function App() {
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        setDatabaseReady(true);
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };

    initializeDatabase();
  }, []);

  if (!databaseReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
