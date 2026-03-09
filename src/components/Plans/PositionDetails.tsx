import dayjs from "../../helpers/dayjsConfig";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApiHelper, PositionInterface, TimeInterface } from "../../../src/helpers";
import { ApiErrorHandler } from "../../../src/helpers/ApiErrorHandler";
import { Card, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { HapticsHelper } from "../../helpers/HapticsHelper";
import { useThemeColors } from "../../theme";

interface Props {
  position: PositionInterface;
  assignment: any;
  times: TimeInterface[];
  onUpdate: () => void;
}

export const PositionDetails = ({ position, assignment, times, onUpdate }: Props) => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  // Early return if required props are null
  if (!position || !assignment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "confirmed": return colors.success;
      case "declined": return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "confirmed": return "check-circle";
      case "declined": return "cancel";
      default: return "schedule";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted": return t("plans.accepted");
      case "declined": return t("plans.declined");
      case "confirmed": return t("plans.confirmed");
      default: return t("plans.pendingResponse");
    }
  };

  const getTimes = () => {
    const timeData = times.sort((a: any, b: any) => (a.startTime > b.startTime ? 1 : -1));
    return timeData.map((time: any) => {
      const startDate = dayjs(time.startTime);
      const endDate = dayjs(time.endTime);
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatTime(endDate);
      return (
        <View key={time?.id || Math.random()} style={styles.timeItem}>
          <MaterialIcons name="access-time" size={16} color={colors.primary} />
          <View style={styles.timeDetails}>
            <Text style={[styles.timeTitle, { color: colors.text }]}>{time.displayName}</Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {formattedStartDate} - {formattedEndDate}
            </Text>
          </View>
        </View>
      );
    });
  };

  const formatDate = (date: any) => date.format("lll");
  const formatTime = (date: any) => date.format("LT");

  const handleAccept = async () => {
    if (!assignment?.id) return;
    try {
      await ApiHelper.post("/assignments/accept/" + assignment.id, [], "DoingApi");
      HapticsHelper.success();
      onUpdate();
    } catch (error) {
      console.error("Error accepting assignment:", error);
      ApiErrorHandler.showErrorAlert(error, "Error");
    }
  };

  const handleDecline = async () => {
    if (!assignment?.id) return;
    try {
      await ApiHelper.post("/assignments/decline/" + assignment.id, [], "DoingApi");
      HapticsHelper.light();
      onUpdate();
    } catch (error) {
      console.error("Error declining assignment:", error);
      ApiErrorHandler.showErrorAlert(error, "Error");
    }
  };

  let latestTime = new Date();
  times.forEach((time: any) => {
    if (new Date(time.endTime) > latestTime) latestTime = new Date(time.endTime);
  });

  const canRespond = assignment.status === "Unconfirmed" && (times.length === 0 || new Date() < latestTime);

  return (
    <Card key={position?.id || Math.random()} style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]} mode="elevated">
      <Card.Content style={styles.cardContent}>
        {/* Position Header */}
        <View style={styles.positionHeader}>
          <View style={styles.positionInfo}>
            <MaterialIcons name="assignment-ind" size={24} color={colors.primary} />
            <Text style={[styles.positionName, { color: colors.text }]}>{position?.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
            <MaterialIcons name={getStatusIcon(assignment.status)} size={16} color={colors.white} />
            <Text style={styles.statusText}>{getStatusText(assignment.status)}</Text>
          </View>
        </View>

        {/* Times Section */}
        {times.length > 0 && (
          <View style={styles.timesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("plans.serviceTimes")}</Text>
            <View style={styles.timesList}>{getTimes()}</View>
          </View>
        )}

        {/* Action Buttons */}
        {canRespond && (
          <View style={styles.actionsContainer}>
            <Button mode="outlined" onPress={handleDecline} style={[styles.declineButton, { borderColor: colors.error }]} labelStyle={[styles.declineButtonText, { color: colors.error }]} icon="close" accessibilityLabel="Decline assignment">
              {t("plans.decline")}
            </Button>
            <Button mode="contained" onPress={handleAccept} style={[styles.acceptButton, { backgroundColor: colors.success }]} labelStyle={styles.acceptButtonText} icon="check" accessibilityLabel="Accept assignment">
              {t("plans.accept")}
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16
  },
  cardContent: { padding: 4 },

  // Position Header
  positionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  positionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  positionName: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
  },

  // Times Section
  timesSection: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12
  },
  timesList: { gap: 8 },
  timeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "rgba(21, 101, 192, 0.05)",
    borderRadius: 8
  },
  timeDetails: {
    marginLeft: 8,
    flex: 1
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2
  },
  timeText: {
    fontSize: 13,
    lineHeight: 18
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8
  },
  declineButton: {
    flex: 1,
    borderRadius: 8
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600"
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  }
});
