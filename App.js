import { StatusBar } from "expo-status-bar";
import { Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ToDoScreen from "./src/screen/ToDoScreen";
import CategoryScreen from "./src/screen/CategoryScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "ToDo") iconName = "list";
            else if (route.name === "Categories") iconName = "pricetags";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: styles.tabBarActiveTintColor,
          tabBarInactiveTintColor: styles.tabBarInactiveTintColor,
          headerStyle: styles.headerStyle,
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: "center",
        })}
      >
        <Tab.Screen
          name="ToDo"
          component={ToDoScreen}
          options={{ title: "Tasks" }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoryScreen}
          options={{ title: "Tags" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  tabBarActiveTintColor: "#1e90ff",
  tabBarInactiveTintColor: "gray",
  headerStyle: { backgroundColor: "#1e90ff" },
  headerTitleStyle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
  },
});
