import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { DateHelper } from "../../helpers";
import { SermonInterface } from "@churchapps/helpers";
import { useThemeColors } from "../../theme";

interface SermonInfoProps {
  sermon: SermonInterface;
  playlistTitle?: string;
  formatDuration: (seconds?: number) => string;
}

export const SermonInfo: React.FC<SermonInfoProps> = ({ sermon, playlistTitle, formatDuration }) => {
  const colors = useThemeColors();
  return (
    <Card style={[styles.infoCard, { shadowColor: colors.shadowBlack }]}>
      <Card.Content style={styles.infoContent}>
        {playlistTitle && (
          <Text variant="labelMedium" style={[styles.seriesLabel, { color: colors.primary }]}>
            {playlistTitle}
          </Text>
        )}

        <Text variant="headlineSmall" style={[styles.sermonTitle, { color: colors.text }]}>
          {sermon.title || "Untitled Sermon"}
        </Text>

        <View style={styles.metaRow}>
          <Text variant="bodyMedium" style={[styles.dateText, { color: colors.disabled }]}>
            {sermon.publishDate ? DateHelper.prettyDate(DateHelper.toDate(sermon.publishDate)) : ""}
          </Text>
          {sermon.duration && (
            <>
              <Text variant="bodyMedium" style={[styles.separator, { color: colors.disabled }]}>
                •
              </Text>
              <Text variant="bodyMedium" style={[styles.durationInfo, { color: colors.disabled }]}>
                {formatDuration(sermon.duration)}
              </Text>
            </>
          )}
        </View>

        {sermon.description && (
          <Text variant="bodyMedium" style={[styles.description, { color: colors.text }]}>
            {sermon.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  infoContent: { padding: 20 },
  seriesLabel: {
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  sermonTitle: {
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 32
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  dateText: {},
  separator: { marginHorizontal: 8 },
  durationInfo: {},
  description: { lineHeight: 22 }
});
