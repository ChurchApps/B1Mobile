import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ArrayHelper, AssignmentInterface, PlanInterface, PositionInterface, TimeInterface } from "../../../src/helpers";
import { router } from "expo-router";
import { Card } from "react-native-paper";
import { InlineLoader } from "../common/LoadingComponents";

interface Props {
  plans: PlanInterface[];
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
  times: TimeInterface[];
  isLoading?: boolean;
}

export const UpcomingDates = ({ plans, positions, assignments, times, isLoading = false }: Props) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const upcomingDates = useMemo(() => {
    if (!assignments || !positions || !plans || !times) return [];

    const data: any = [];
    assignments.forEach(assignment => {
      const position = positions.find(p => p.id === assignment.positionId);
      const plan = plans.find(p => p?.id === position?.planId);
      const time = times.find(t => t.planId === plan?.id);

      if (position && plan && time) {
        data.push({
          assignmentId: assignment?.id,
          planId: plan?.id,
          planName: plan?.name,
          serviceDate: plan.serviceDate,
          position: position?.name,
          time: time?.displayName,
          status: assignment.status || "Unconfirmed"
        });
      }
    });
    ArrayHelper.sortBy(data, "serviceDate", true);
    return data;
  }, [assignments, positions, plans, times]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="schedule" style={styles.headerIcon} size={24} />
        <Text style={styles.headerTitle}>Upcoming Dates</Text>
      </View>

      <Card style={styles.contentCard}>
        <Card.Content>
          {isLoading ? (
            <InlineLoader size="large" text="Loading upcoming dates..." />
          ) : upcomingDates.length === 0 ? (
            <View style={styles.emptyStateContent}>
              <MaterialIcons name="event-busy" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No upcoming dates found</Text>
              <Text style={styles.emptyStateSubtext}>Your future assignments will appear here</Text>
            </View>
          ) : (
        <View style={styles.cardsList}>
          {upcomingDates.map((item, idx) => (
            <Card key={idx} style={styles.upcomingCard} mode="elevated">
              <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.7} onPress={() => router.push("/(drawer)/planDetails/" + item.planId)}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName} numberOfLines={1}>
                        {item.planName}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="event" size={18} color="#0D47A1" />
                      <Text style={styles.detailText}>{dayjs(item.serviceDate).format("MMM DD, YYYY")}</Text>
                    </View>

                    {item.time && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="access-time" size={18} color="#0D47A1" />
                        <Text style={styles.detailText}>{item.time}</Text>
                      </View>
                    )}

                    <View style={styles.roleContainer}>
                      <MaterialIcons name="assignment-ind" size={18} color="#0D47A1" />
                      <Text style={styles.roleText}>{item.position}</Text>
                    </View>
                  </View>
                </Card.Content>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "#70DC87";
    case "declined":
      return "#B0120C";
    case "pending":
      return "#FEAA24";
    default:
      return "#9E9E9E";
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 4
  },
  headerIcon: {
    color: "#0D47A1",
    marginRight: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c"
  },

  // Content Card
  contentCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 32
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginTop: 16,
    textAlign: "center"
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center"
  },

  // Cards List
  cardsList: {
    gap: 12
  },
  upcomingCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  cardTouchable: {
    borderRadius: 16
  },
  cardContent: {
    padding: 4
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  planInfo: {
    flex: 1,
    marginRight: 12
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c"
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },

  // Details Container
  detailsContainer: {
    gap: 12
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(21, 101, 192, 0.05)",
    borderRadius: 8
  },
  detailText: {
    fontSize: 14,
    color: "#3c3c3c",
    fontWeight: "500",
    marginLeft: 8
  },

  // Role Container
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(21, 101, 192, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  roleText: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "600",
    marginLeft: 8
  }
});
