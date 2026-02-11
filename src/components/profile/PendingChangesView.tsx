import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { ProfileChange } from "../../interfaces";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

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
      <Text variant="bodyMedium" style={styles.changeValue} numberOfLines={2}>
        {change.value || t("profileEdit.empty")}
      </Text>
    );
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialIcons name="pending-actions" size={24} color="#FFC107" />
          <Text variant="titleMedium" style={styles.headerText}>
            {t("profileEdit.pendingChanges")}
          </Text>
        </View>

        <Text variant="bodySmall" style={styles.description}>
          {t("profileEdit.pendingChangesDescription")}
        </Text>

        <ScrollView style={styles.changesList} nestedScrollEnabled>
          {changes.map((change, index) => (
            <View key={`${change.field}-${index}`} style={styles.changeItem}>
              <Text variant="labelMedium" style={styles.changeLabel}>
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
            style={styles.cancelButton}
            disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            mode="contained"
            onPress={onSubmit}
            style={styles.submitButton}
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
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFC107"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  headerText: {
    color: "#3c3c3c",
    fontWeight: "600"
  },
  description: {
    color: "#9E9E9E",
    marginBottom: 16
  },
  changesList: {
    maxHeight: 200,
    marginBottom: 16
  },
  changeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE082"
  },
  changeLabel: {
    color: "#795548",
    fontWeight: "600",
    marginBottom: 4
  },
  changeValue: { color: "#3c3c3c" },
  photoPreview: {
    width: 60,
    height: 45,
    borderRadius: 4
  },
  actions: {
    flexDirection: "row",
    gap: 12
  },
  cancelButton: {
    flex: 1,
    borderColor: "#9E9E9E"
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#0D47A1"
  }
});
