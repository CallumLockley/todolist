import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fallback from "../components/Fallback"; // Importing the Fallback component

const ToDoScreen = () => {
  const [todo, setToDo] = React.useState("");
  const [todolist, setTodos] = React.useState([]);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [editedtodo, seteditedtodo] = React.useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  // Load todos from AsyncStorage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const stored = await AsyncStorage.getItem("todos");
        if (stored) setTodos(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load todos:", e);
      }
    };
    loadTodos();
  }, []);

  // Success animation effect
  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSuccess(false));
    }
  }, [showSuccess, fadeAnim]);

  // Save new todo to AsyncStorage and update state
  const handleAddToDo = async () => {
    if (!todo || todo.trim() === "") {
      Alert.alert("Error", "Task cannot be empty.");
      return;
    }
    try {
      const newTodo = { id: Date.now().toString(), title: todo };
      const updatedTodos = [...todolist, newTodo];
      await AsyncStorage.setItem("todos", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setToDo("");
    } catch (e) {
      console.error("Failed to save todo:", e);
    }
  };

  const handleDeleteToDo = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const filteredTodos = todolist.filter((item) => item.id !== id);
              await AsyncStorage.setItem(
                "todos",
                JSON.stringify(filteredTodos)
              );
              setTodos(filteredTodos);
              setShowSuccess(true); // Trigger success animation
            } catch (e) {
              console.error("Failed to delete todo:", e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditToDo = (item) => {
    seteditedtodo(item); // Set the todo to be edited
    setToDo(item.title); // Populate the input with the current title
    setTimeout(() => {
      inputRef.current?.focus(); // Focus the input to show keyboard
    }, 100);
  };

  const handleSaveEdit = async () => {
    if (!todo || todo.trim() === "") {
      Alert.alert("Error", "Task cannot be empty.");
      return;
    }
    try {
      const updatedTodos = todolist.map((t) =>
        t.id === editedtodo.id ? { ...t, title: todo } : t
      );
      await AsyncStorage.setItem("todos", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setToDo("");
      seteditedtodo(null);
      Keyboard.dismiss(); // Close the keyboard after saving
    } catch (e) {
      console.error("Failed to edit todo:", e);
    }
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <TextInput
        ref={inputRef}
        style={{
          borderWidth: 2,
          borderColor: "#1e90ff",
          borderRadius: 6,
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
        placeholder="Enter a task..."f
        value={todo}
        onChangeText={(text) => setToDo(text)}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "black",
          borderRadius: 6,
          paddingVertical: 12,
          marginTop: 24,
          alignItems: "center",
        }}
        onPress={editedtodo ? handleSaveEdit : handleAddToDo}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
          {editedtodo ? "Save" : "Add"}
        </Text>
      </TouchableOpacity>

      {/* Render To Do List */}
      <FlatList
        style={{ marginTop: 24 }}
        data={todolist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              borderWidth: 2,
              borderColor: "#1e90ff",
              borderRadius: 6,
              backgroundColor: "white",
              paddingHorizontal: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.8,
              shadowRadius: 3.0,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={() => handleEditToDo(item)}
              >
                <Ionicons name="pencil" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteToDo(item.id)}>
                <Ionicons name="trash" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
      {todolist.length === 0 && <Fallback />}
    </View>
  );
};

export default ToDoScreen;
