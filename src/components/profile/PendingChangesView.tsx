import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { ProfileChange } from "../../interfaces";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface PendingChangesViewProps {
  changes: ProfileChange[];
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PendingChangesView: React.FC<PendingChangesViewProps> = ({
  changes,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  if (changes.length === 0) {
    return null;
  }

  const renderChangeValue = (change: ProfileChange) => {
    if (change.field === "photo" && change.value.startsWith("data:")) {
      return (
        <Image
          source={{ uri: change.value }}
          style={styles.photoPreview}
          resizeMode="cover"
        />
      );
    }
    return (
      <Text variant="bodyMedium" style={[styles.changeValue, { color: colors.text }]} numberOfLines={2}>
        {change.value || t("profileEdit.empty")}
      </Text>
    );
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialIcons name="pending-actions" size={24} color={colors.warning} />
          <Text variant="titleMedium" style={[styles.headerText, { color: colors.text }]}>
            {t("profileEdit.pendingChanges")}
          </Text>
        </View>

        <Text variant="bodySmall" style={[styles.description, { color: colors.disabled }]}>
          {t("profileEdit.pendingChangesDescription")}
        </Text>

        <ScrollView style={styles.changesList} nestedScrollEnabled>
          {changes.map((change, index) => (
            <View key={`${change.field}-${index}`} style={[styles.changeItem, { borderBottomColor: colors.warningBg }]}>
              <Text variant="labelMedium" style={[styles.changeLabel, { color: colors.text }]}>
                {change.label}
              </Text>
              {renderChangeValue(change)}
            </View>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.cancelButton, { borderColor: colors.disabled }]}
            disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            mode="contained"
            onPress={onSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            loading={isSubmitting}
            disabled={isSubmitting}>
            {t("profileEdit.submitForApproval")}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  headerText: { fontWeight: "600" },
  description: { marginBottom: 16 },
  changesList: {
    maxHeight: 200,
    marginBottom: 16
  },
  changeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  changeLabel: {
    fontWeight: "600",
    marginBottom: 4
  },
  changeValue: {},
  photoPreview: {
    width: 60,
    height: 45,
    borderRadius: 4
  },
  actions: {
    flexDirection: "row",
    gap: 12
  },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2 }
});
