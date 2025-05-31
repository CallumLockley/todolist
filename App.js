import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import ToDoScreen from "./src/screen/ToDoScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#1e90ff",
            paddingVertical: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold", letterSpacing: 1 }}>
            ToDo List
          </Text>
        </View>
        <ToDoScreen />
      </View>
      {/* Footer anchored to bottom */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#fff",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: "#888", fontSize: 14 }}>
          © {new Date().getFullYear()} Callum Lockley. All rights reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
