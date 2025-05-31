import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Fallback = () => (
          <View
            style={{
              marginTop: 24,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#888" }}>
              No tasks available.
            </Text>
          </View>
);

export default Fallback;