import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { DateHelper } from "../../helpers";
import { SermonInterface } from "@churchapps/helpers";

interface SermonInfoProps {
  sermon: SermonInterface;
  playlistTitle?: string;
  formatDuration: (seconds?: number) => string;
}

export const SermonInfo: React.FC<SermonInfoProps> = ({ sermon, playlistTitle, formatDuration }) => {
  return (
    <Card style={styles.infoCard}>
      <Card.Content style={styles.infoContent}>
        {playlistTitle && (
          <Text variant="labelMedium" style={styles.seriesLabel}>
            {playlistTitle}
          </Text>
        )}

        <Text variant="headlineSmall" style={styles.sermonTitle}>
          {sermon.title || "Untitled Sermon"}
        </Text>

        <View style={styles.metaRow}>
          <Text variant="bodyMedium" style={styles.dateText}>
            {sermon.publishDate ? DateHelper.prettyDate(new Date(sermon.publishDate)) : ""}
          </Text>
          {sermon.duration && (
            <>
              <Text variant="bodyMedium" style={styles.separator}>
                •
              </Text>
              <Text variant="bodyMedium" style={styles.durationInfo}>
                {formatDuration(sermon.duration)}
              </Text>
            </>
          )}
        </View>

        {sermon.description && (
          <Text variant="bodyMedium" style={styles.description}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  infoContent: { padding: 20 },
  seriesLabel: {
    color: "#0D47A1",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  sermonTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 32
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  dateText: { color: "#9E9E9E" },
  separator: {
    color: "#9E9E9E",
    marginHorizontal: 8
  },
  durationInfo: { color: "#9E9E9E" },
  description: {
    color: "#3c3c3c",
    lineHeight: 22
  }
});
