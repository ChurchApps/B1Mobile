import React from "react";
import { StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors, CommonStyles } from "../../theme";
import { designSystem } from "../../theme/designSystem";

interface EmptyStateProps {
  type: "playlists" | "sermons";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const colors = useThemeColors();
  const isPlaylists = type === "playlists";

  return (
    <Card style={[styles.emptyCard, { shadowColor: colors.shadowBlack }]}>
      <Card.Content style={CommonStyles.columnCenter}>
        <MaterialIcons
          name={isPlaylists ? "playlist-add" : "video-library"}
          size={48}
          color={colors.iconColor}
          style={styles.emptyIcon}
        />
        <Text variant="titleMedium" style={[CommonStyles.titleText, CommonStyles.textCenter, { color: colors.text, marginBottom: 8 }]}>
          {isPlaylists ? "No Sermon Series Available" : "No Recent Sermons"}
        </Text>
        <Text variant="bodyMedium" style={[CommonStyles.emptyStateText, { color: colors.disabled, lineHeight: 20 }]}>
          {isPlaylists
            ? "Check back later for new sermon series from your church."
            : "Check back later for new sermons from your church."}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: designSystem.borderRadius.xl,
    ...designSystem.shadows.sm
  },
  emptyIcon: { marginBottom: 16 }
});
