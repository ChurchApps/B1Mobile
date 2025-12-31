import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import Markdown from "@ronradtke/react-native-markdown-display";
import { useTranslation } from "react-i18next";

interface GroupAboutTabProps {
  about?: string;
}

export const GroupAboutTab: React.FC<GroupAboutTabProps> = ({ about }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.aboutContainer}>
      {about ? (
        <Markdown style={styles.markdownStyles}>{about}</Markdown>
      ) : (
        <View style={styles.emptyState}>
          <Avatar.Icon size={64} icon="information" style={styles.emptyIcon} />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            {t("groups.noDescriptionAvailable")}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {t("groups.groupDetailsWillAppear")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: {
    minHeight: 200
  },
  markdownStyles: {
    body: {
      color: "#3c3c3c",
      fontSize: 16,
      lineHeight: 24
    }
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});