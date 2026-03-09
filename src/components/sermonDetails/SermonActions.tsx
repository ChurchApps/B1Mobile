import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors } from "../../theme";

interface SermonActionsProps {
  onShare: () => void;
  onExternalLink: () => void;
  onWatchVideo: () => void;
  showWatchButton: boolean;
}

export const SermonActions: React.FC<SermonActionsProps> = ({
  onShare,
  onExternalLink,
  onWatchVideo,
  showWatchButton
}) => {
  const colors = useThemeColors();
  return (
    <View style={styles.actionContainer}>
      <View style={styles.actionRow}>
        <Button
          mode="outlined"
          onPress={onShare}
          style={[styles.actionButton, { borderColor: colors.primary }]}
          icon={() => <MaterialIcons name="share" size={20} color={colors.primary} />}>
          Share
        </Button>

        <Button
          mode="outlined"
          onPress={onExternalLink}
          style={[styles.actionButton, { borderColor: colors.primary }]}
          icon={() => <MaterialIcons name="open-in-new" size={20} color={colors.primary} />}>
          Open Link
        </Button>
      </View>

      {showWatchButton && (
        <Button
          mode="contained"
          onPress={onWatchVideo}
          style={[styles.watchButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          icon={() => <MaterialIcons name="play-arrow" size={20} color={colors.onPrimary} />}>
          Watch Sermon
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: { marginTop: 8 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8
  },
  watchButton: {
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  }
});
