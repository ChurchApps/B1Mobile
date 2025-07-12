import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";

interface ChurchSelectionOverlayProps {
  visible: boolean;
}

export const ChurchSelectionOverlay: React.FC<ChurchSelectionOverlayProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.selectionOverlay}>
      <Card style={styles.selectionCard}>
        <Card.Content style={styles.selectionContent}>
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text variant="titleMedium" style={styles.selectionText}>
            Connecting to church...
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  selectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  selectionContent: {
    alignItems: "center",
    padding: 32
  },
  selectionText: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center"
  }
});