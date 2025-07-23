import dayjs from "dayjs";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApiHelper, PositionInterface, TimeInterface } from "../../../src/helpers";
import { Card, Button } from "react-native-paper";

interface Props {
  position: PositionInterface;
  assignment: any;
  times: TimeInterface[];
  onUpdate: () => void;
}

export const PositionDetails = ({ position, assignment, times, onUpdate }: Props) => {
  // Early return if required props are null
  if (!position || !assignment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "confirmed":
        return "#70DC87";
      case "declined":
        return "#B0120C";
      default:
        return "#FEAA24";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "confirmed":
        return "check-circle";
      case "declined":
        return "cancel";
      default:
        return "schedule";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      case "confirmed":
        return "Confirmed";
      default:
        return "Pending Response";
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
          <MaterialIcons name="access-time" size={16} color="#0D47A1" />
          <View style={styles.timeDetails}>
            <Text style={styles.timeTitle}>{time.displayName}</Text>
            <Text style={styles.timeText}>
              {formattedStartDate} - {formattedEndDate}
            </Text>
          </View>
        </View>
      );
    });
  };

  const formatDate = (date: any) => date.format("MMM DD, YYYY h:mm A");
  const formatTime = (date: any) => date.format("h:mm A");

  const handleAccept = () => {
    if (!assignment?.id) return;
    ApiHelper.post("/assignments/accept/" + assignment.id, [], "DoingApi").then(() => {
      onUpdate();
    });
  };

  const handleDecline = () => {
    if (!assignment?.id) return;
    ApiHelper.post("/assignments/decline/" + assignment.id, [], "DoingApi").then(() => {
      onUpdate();
    });
  };

  let latestTime = new Date();
  times.forEach((time: any) => {
    if (new Date(time.endTime) > latestTime) latestTime = new Date(time.endTime);
  });

  const canRespond = assignment.status === "Unconfirmed" && (times.length === 0 || new Date() < latestTime);

  return (
    <Card key={position?.id || Math.random()} style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        {/* Position Header */}
        <View style={styles.positionHeader}>
          <View style={styles.positionInfo}>
            <MaterialIcons name="assignment-ind" size={24} color="#0D47A1" />
            <Text style={styles.positionName}>{position?.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
            <MaterialIcons name={getStatusIcon(assignment.status)} size={16} color="white" />
            <Text style={styles.statusText}>{getStatusText(assignment.status)}</Text>
          </View>
        </View>

        {/* Times Section */}
        {times.length > 0 && (
          <View style={styles.timesSection}>
            <Text style={styles.sectionTitle}>Service Times</Text>
            <View style={styles.timesList}>{getTimes()}</View>
          </View>
        )}

        {/* Action Buttons */}
        {canRespond && (
          <View style={styles.actionsContainer}>
            <Button mode="outlined" onPress={handleDecline} style={styles.declineButton} labelStyle={styles.declineButtonText} icon="close">
              Decline
            </Button>
            <Button mode="contained" onPress={handleAccept} style={styles.acceptButton} labelStyle={styles.acceptButtonText} icon="check">
              Accept
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16,
    backgroundColor: "#FFFFFF"
  },
  cardContent: {
    padding: 4
  },

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
    color: "#3c3c3c",
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
  timesSection: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginBottom: 12
  },
  timesList: {
    gap: 8
  },
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
    color: "#3c3c3c",
    marginBottom: 2
  },
  timeText: {
    fontSize: 13,
    color: "#666",
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
    borderColor: "#B0120C",
    borderRadius: 8
  },
  declineButtonText: {
    color: "#B0120C",
    fontSize: 14,
    fontWeight: "600"
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#0D47A1",
    borderRadius: 8
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  }
});
