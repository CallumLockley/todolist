import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Keyboard,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fallback from "../components/Fallback";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

const ToDoScreen = () => {
  const [todo, setToDo] = React.useState("");
  const [todolist, setTodos] = React.useState([]);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [editedtodo, seteditedtodo] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState(null);
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

  // Load categories from AsyncStorage every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadCategories = async () => {
        const stored = await AsyncStorage.getItem("categories");
        let loadedCategories = [];
        if (stored) loadedCategories = JSON.parse(stored);
        if (!loadedCategories || loadedCategories.length === 0) {
          // Add default category if none exist
          const defaultCategory = [{ id: "default-tasks", name: "Tasks" }];
          await AsyncStorage.setItem("categories", JSON.stringify(defaultCategory));
          setCategories(defaultCategory);
        } else {
          setCategories(loadedCategories);
        }
      };
      loadCategories();
    }, [])
  );

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

  // Save new todo to AsyncStorage and update state (from modal)
  const handleAddToDo = async () => {
    if (!newTodo || newTodo.trim() === "" || !newCategory) {
      Alert.alert("Error", "Task and category cannot be empty.");
      return;
    }
    try {
      const todoObj = {
        id: Date.now().toString(),
        title: newTodo,
        categoryId: newCategory,
      };
      const updatedTodos = [...todolist, todoObj];
      await AsyncStorage.setItem("todos", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setNewTodo("");
      setNewCategory(null);
      setModalVisible(false);
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
    <View style={styles.container}>
      {/* No tasks available message at the top, centered in the middle if no tasks */}
      {todolist.length === 0 && (
        <View style={styles.fallbackContainer}>
          <Fallback />
        </View>
      )}

      {/* Render To Do List */}
      <FlatList
        style={styles.list}
        data={todolist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={styles.todoText}>{item.title}</Text>
            <View style={styles.todoActions}>
              <TouchableOpacity
                style={styles.editButton}
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

      {/* Add Task Button at the bottom */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>
            Add Task
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Todo Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add New Task
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task name..."
              value={newTodo}
              onChangeText={setNewTodo}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newCategory}
                onValueChange={setNewCategory}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select category..." value={null} enabled={false} />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setNewTodo("");
                  setNewCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddToDo}
              >
                <Text style={styles.saveButtonText}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16
    },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  list: {
    marginTop: 16,
  },
  todoItem: {
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3.0,
  },
  todoText: {
    fontSize: 16,
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 16,
  },
  addButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  addButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.0,
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#1e90ff",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#1e90ff",
    borderRadius: 6,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  pickerItem: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    marginRight: 8,
    color: "#888",
    fontSize: 18,
    textAlign: "center",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ToDoScreen;
