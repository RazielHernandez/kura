import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ACTIVE_COLOR = "#2563EB";
const INACTIVE_COLOR = "#8E8E93";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarLabel: "Collections",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="albums-outline"
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="custom-lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="list-outline"
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
    </Tabs>
  );
}
