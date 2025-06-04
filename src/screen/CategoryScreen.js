import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
const COLOR_OPTIONS = [
  "#1e90ff", // blue
  "#ff6347", // tomato
  "#32cd32", // lime green
  "#ffa500", // orange
  "#8a2be2", // blue violet
  "#ff69b4", // hot pink
  "#20b2aa", // light sea green
  "#ffd700", // gold
  "#ff4500", // orange red
  "#00bfff", // deep sky blue
];

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [removingCategoryId, setRemovingCategoryId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem("categories");
      if (stored) {
        // If any category is missing a color, assign a random one
        let loaded = JSON.parse(stored);
        let changed = false;
        loaded = loaded.map((cat) => {
          if (!cat.color) {
            // Set default category to blue, others random
            if (cat.id === "default-tasks") {
              changed = true;
              return { ...cat, color: "#1e90ff" };
            }
            changed = true;
            return {
              ...cat,
              color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            };
          }
          // If default category has a non-blue color, set it to blue
          if (cat.id === "default-tasks" && cat.color !== "#1e90ff") {
            changed = true;
            return { ...cat, color: "#1e90ff" };
          }
          return cat;
        });
        if (changed)
          await AsyncStorage.setItem("categories", JSON.stringify(loaded));
        setCategories(loaded);
      }
    };
    loadCategories();
  }, []);

  const saveCategories = async (newCategories) => {
    await AsyncStorage.setItem("categories", JSON.stringify(newCategories));
    setCategories(newCategories);
  };

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    const newCategory = {
      id: Date.now().toString(),
      name: categoryName,
      color: selectedColor,
    };
    const updated = [...categories, newCategory];
    await saveCategories(updated);
    setCategoryName("");
    setSelectedColor(COLOR_OPTIONS[0]);
  };

  const startEditCategory = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditModalVisible(true);
  };

  const saveEditCategory = async () => {
    const updated = categories.map((cat) =>
      cat.id === editingId ? { ...cat, name: editingName } : cat
    );
    await saveCategories(updated);
    setEditingId(null);
    setEditingName("");
    setEditModalVisible(false);
  };

  const removeCategory = async (id) => {
    Alert.alert("Delete Tag", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setRemovingCategoryId(id);
          setTimeout(async () => {
            const updated = categories.filter((cat) => cat.id !== id);
            await saveCategories(updated);
            setRemovingCategoryId(null);
          }, 300); // Animation duration
        },
      },
    ]);
  };

  const isDefaultCategory = (cat) => cat.id === "default-tasks";

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isRemoving = removingCategoryId === item.id;
          const animatedStyle = isRemoving
            ? { opacity: 0, transform: [{ scale: 0.8 }], height: 0 }
            : { opacity: 1, transform: [{ scale: 1 }], height: 48 };
          return (
            <Animated.View style={[styles.categoryRow, animatedStyle]}>
              {editingId === item.id && editModalVisible ? null : (
                <>
                  {/* Color preview circle */}
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: item.color || "#1e90ff" },
                    ]}
                  />
                  <Text style={styles.categoryText}>{item.name}</Text>
                  {!isDefaultCategory(item) && (
                    <>
                      <TouchableOpacity
                        onPress={() => startEditCategory(item)}
                        style={styles.iconButton}
                      >
                        <Ionicons name="pencil" size={20} color="#1e90ff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeCategory(item.id)}
                        style={styles.iconButton}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </Animated.View>
          );
        }}
      />
      {/* Add Category Button at the bottom */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Tag</Text>
        </TouchableOpacity>
      </View>
      {/* Add Category Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tag</Text>
            <TextInput
              style={styles.input}
              placeholder="New Tag"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
            <View style={styles.colorPickerRow}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setAddModalVisible(false);
                  setCategoryName("");
                  setSelectedColor(COLOR_OPTIONS[0]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  await addCategory();
                  setAddModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit Category Modal */}
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setEditModalVisible(false);
          setEditingId(null);
          setEditingName("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              style={styles.input}
              value={editingName}
              onChangeText={setEditingName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingId(null);
                  setEditingName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveEditCategory}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
    marginHorizontal: 16,
    marginTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
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
    backgroundColor: "white",
  },
  addButtonContainer: {
    position: "absolute",
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
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  categoryText: {
    flex: 1,
    fontSize: 18,
    height: 40,
    textAlignVertical: "center",
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
    height: 40,
    justifyContent: "center",
  },
  editIcon: {
    color: "#1e90ff",
    fontSize: 20,
  },
  deleteIcon: {
    color: "red",
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
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
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
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  colorPickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: "#eee",
  },
  selectedColorCircle: {
    borderColor: "#222",
    borderWidth: 3,
  },
});

export default CategoryScreen;
