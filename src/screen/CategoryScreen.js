import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Animated, Modal, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [removingCategoryId, setRemovingCategoryId] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem("categories");
      if (stored) setCategories(JSON.parse(stored));
    };
    loadCategories();
  }, []);

  const saveCategories = async (newCategories) => {
    await AsyncStorage.setItem("categories", JSON.stringify(newCategories));
    setCategories(newCategories);
  };

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    const newCategory = { id: Date.now().toString(), name: categoryName };
    const updated = [...categories, newCategory];
    await saveCategories(updated);
    setCategoryName("");
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
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="New Tag"
          value={categoryName}
          onChangeText={setCategoryName}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addCategory}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
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
                  <Text style={styles.categoryText}>{item.name}</Text>
                  {!isDefaultCategory(item) && (
                    <>
                      <TouchableOpacity onPress={() => startEditCategory(item)} style={styles.iconButton}>
                        <Text>
                          <Text style={styles.editIcon}>
                            &#9998;
                          </Text>
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeCategory(item.id)} style={styles.iconButton}>
                        <Text>
                          <Text style={styles.deleteIcon}>
                            &#128465;
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </Animated.View>
          );
        }}
      />
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
    flex: 1,
    borderWidth: 2,
    borderColor: "#1e90ff",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  categoryText: {
    flex: 1,
    fontSize: 18,
    height: 40,
    textAlignVertical: 'center',
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
    height: 40,
    justifyContent: 'center',
  },
  editIcon: {
    color: '#1e90ff',
    fontSize: 20,
  },
  deleteIcon: {
    color: 'red',
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

export default CategoryScreen;
