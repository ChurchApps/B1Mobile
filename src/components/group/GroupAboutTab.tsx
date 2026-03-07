import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import Markdown from "@ronradtke/react-native-markdown-display";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface GroupAboutTabProps {
  about?: string;
}

export const GroupAboutTab: React.FC<GroupAboutTabProps> = ({ about }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View style={styles.aboutContainer}>
      {about ? (
        <Markdown style={{ body: { color: colors.text, fontSize: 16, lineHeight: 24 } }}>{about}</Markdown>
      ) : (
        <View style={styles.emptyState}>
          <Avatar.Icon size={64} icon="information" style={[styles.emptyIcon, { backgroundColor: colors.iconBackground }]} />
          <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
            {t("groups.noDescriptionAvailable")}
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.disabled }]}>
            {t("groups.groupDetailsWillAppear")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: { minHeight: 200 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  }
});
