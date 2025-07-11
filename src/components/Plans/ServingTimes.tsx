import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ArrayHelper, AssignmentInterface, PlanInterface, PositionInterface } from "../../../src/helpers";
import { router } from "expo-router";
import { Card } from "react-native-paper";

interface Props {
  plans: PlanInterface[];
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
}
export const ServingTimes = ({ plans, positions, assignments }: Props) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  const servingTimes = useMemo(() => {
    if (!assignments?.length || !positions?.length || !plans?.length) return [];

    const data: any = [];
    assignments.forEach(assignment => {
      const position = positions.find(p => p.id === assignment.positionId);
      const plan = plans.find(p => p?.id === position?.planId);
      if (position && plan) data.push({ assignmentId: assignment?.id, planId: plan?.id, planName: plan?.name, serviceDate: plan.serviceDate, position: position?.name, status: assignment.status || "Unconfirmed" });
    });
    ArrayHelper.sortBy(data, "serviceDate", true);
    return data;
  }, [assignments, positions, plans]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="schedule" style={styles.headerIcon} size={24} />
        <Text style={styles.headerTitle}>Serving Times</Text>
      </View>

      {servingTimes.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <Card.Content style={styles.emptyStateContent}>
            <MaterialIcons name="event-busy" size={48} color="#9E9E9E" />
            <Text style={styles.emptyStateText}>No serving times found</Text>
            <Text style={styles.emptyStateSubtext}>Your upcoming assignments will appear here</Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.cardsList}>
          {servingTimes.map((item, idx) => (
            <Card key={idx} style={styles.servingCard} mode="elevated">
              <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.7} onPress={() => router.push("/(drawer)/planDetails/" + item.planId)}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName} numberOfLines={1}>
                        {item.planName}
                      </Text>
                      <View style={styles.dateContainer}>
                        <MaterialIcons name="event" size={16} color="#1565C0" style={styles.dateIcon} />
                        <Text style={styles.dateText}>{dayjs(item.serviceDate).format("MMM DD, YYYY")}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.roleContainer}>
                    <MaterialIcons name="assignment-ind" size={18} color="#1565C0" />
                    <Text style={styles.roleText}>{item.position}</Text>
                  </View>
                </Card.Content>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      )}
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
    color: "#1565C0",
    marginRight: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c"
  },

  // Empty State
  emptyStateCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
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
  servingCard: {
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
    marginBottom: 12
  },
  planInfo: {
    flex: 1,
    marginRight: 12
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c",
    marginBottom: 6
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  dateIcon: {
    marginRight: 6
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
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
    color: "#1565C0",
    fontWeight: "600",
    marginLeft: 6
  }
});
