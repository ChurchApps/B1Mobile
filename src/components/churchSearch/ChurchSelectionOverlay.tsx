import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { useThemeColors } from "../../theme";

interface ChurchSelectionOverlayProps {
  visible: boolean;
}

export const ChurchSelectionOverlay: React.FC<ChurchSelectionOverlayProps> = ({ visible }) => {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <View style={[styles.selectionOverlay, { backgroundColor: colors.modalOverlay }]}>
      <Card style={[styles.selectionCard, { backgroundColor: colors.card }]}>
        <Card.Content style={styles.selectionContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="titleMedium" style={[styles.selectionText, { color: colors.text }]}>
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  selectionCard: {
    borderRadius: 16,
    margin: 32,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  selectionContent: {
    alignItems: "center",
    padding: 32
  },
  selectionText: {
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center"
  }
});
