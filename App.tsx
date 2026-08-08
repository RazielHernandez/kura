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

  useEffect(() => {
    if (!databaseReady) {
      return;
    }

    const testCollectionRepository = async () => {
      try {
        const repository = new CollectionRepository();

        // 1. Create
        const collection = await repository.create(
          "My LEGO Collection",
          {
            icon: "🧱",
            color: "#E53935",
            description: "My LEGO sets",
          }
        );

        console.log("1. Created:", collection);

        // 2. Get by ID
        const found = await repository.getById(collection.id);

        console.log("2. Get by ID:", found);

        // 3. Update
        const updated = await repository.update(
          collection.id,
          {
            name: "My LEGO Sets",
            description: "My LEGO collection",
          }
        );

        console.log("3. Updated:", updated);

        // 4. Search
        const searchResults = await repository.search("LEGO");

        console.log("4. Search:", searchResults);

        // 5. Soft delete
        await repository.softDelete(collection.id);

        const afterDelete =
          await repository.getById(collection.id);

        console.log("5. After delete:", afterDelete);

        // 6. Restore
        await repository.restore(collection.id);

        const restored =
          await repository.getById(collection.id);

        console.log("6. Restored:", restored);

      } catch (error) {
        console.error(
          "Collection repository test failed:",
          error
        );
      }
    };

    testCollectionRepository();
  }, [databaseReady]);

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
