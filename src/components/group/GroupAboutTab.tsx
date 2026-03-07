import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-paper";
import Markdown from "@ronradtke/react-native-markdown-display";
import { useTranslation } from "react-i18next";
import { useThemeColors, CommonStyles } from "../../theme";

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
        <View style={[CommonStyles.columnCenter, { paddingVertical: 32, paddingHorizontal: 24 }]}>
          <Avatar.Icon size={64} icon="information" style={[{ marginBottom: 16 }, { backgroundColor: colors.iconBackground }]} />
          <Text variant="titleMedium" style={[CommonStyles.titleText, CommonStyles.textCenter, { color: colors.text, marginBottom: 8 }]}>
            {t("groups.noDescriptionAvailable")}
          </Text>
          <Text variant="bodyMedium" style={[CommonStyles.emptyStateText, { color: colors.disabled, lineHeight: 20 }]}>
            {t("groups.groupDetailsWillAppear")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: { minHeight: 200 }
});
