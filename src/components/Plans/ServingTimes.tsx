import { DimensionHelper } from "@/helpers/DimensionHelper";
import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Animated } from "react-native";
import Icons from "react-native-vector-icons/FontAwesome5";
import { ArrayHelper, AssignmentInterface, Constants, PlanInterface, PositionInterface } from "../../../src/helpers";
import { router } from "expo-router";

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
        <Icons name="calendar-alt" style={styles.headerIcon} size={DimensionHelper.wp(5.5)} />
        <Text style={styles.headerTitle}>Serving Times</Text>
      </View>

      {servingTimes.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons name="calendar-times" size={DimensionHelper.wp(8)} color="#ccc" />
          <Text style={styles.emptyStateText}>No serving times found</Text>
        </View>
      ) : (
        <View>
          {servingTimes.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.card, { marginBottom: DimensionHelper.hp(1.5), position: "relative" }]} activeOpacity={0.8} onPress={() => router.push("/(drawer)/planDetails/" + item.planId)}>
              <View style={[styles.statusBadge, styles.statusBadgeTopRight, { backgroundColor: "#1976d2" }]}>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>{item.status}</Text>
              </View>
              <View style={styles.roleBottomRight}>
                <Icons name="user-tie" size={14} color={Constants.Colors.app_color} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 16, color: "#222" }}>{item.position}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.planInfo}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#222" }} numberOfLines={1}>
                    {item.planName}
                  </Text>
                  <Text style={{ fontSize: 16, color: "#222" }}>{dayjs(item.serviceDate).format("YYYY-MM-DD")}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DimensionHelper.hp(3)
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DimensionHelper.hp(2)
  },
  headerIcon: {
    color: Constants.Colors.app_color,
    marginRight: DimensionHelper.wp(2)
  },
  headerTitle: {
    fontSize: DimensionHelper.wp(4.5),
    fontWeight: "600",
    color: "#333"
  },
  listContent: {
    gap: DimensionHelper.hp(1.5)
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: DimensionHelper.wp(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  planInfo: {
    flex: 1,
    marginRight: DimensionHelper.wp(2)
  },
  planNameVisible: {
    fontSize: DimensionHelper.wp(3.8),
    fontWeight: "600",
    color: "#222",
    marginBottom: 4
  },
  dateTextVisible: {
    fontSize: DimensionHelper.wp(3.2),
    color: "#333"
  },
  roleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: DimensionHelper.wp(3)
  },
  roleIcon: {
    marginRight: 6
  },
  roleTextVisible: {
    fontSize: DimensionHelper.wp(3.2),
    color: "#333"
  },
  statusBadge: {
    paddingHorizontal: DimensionHelper.wp(3),
    paddingVertical: DimensionHelper.hp(0.5),
    borderRadius: 12,
    minWidth: DimensionHelper.wp(20),
    alignItems: "center"
  },
  statusText: {
    color: "white",
    fontSize: DimensionHelper.wp(3),
    fontWeight: "500"
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: DimensionHelper.wp(6),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: DimensionHelper.hp(2)
  },
  emptyStateText: {
    fontSize: DimensionHelper.wp(3.5),
    color: "#666",
    marginTop: DimensionHelper.hp(2),
    marginBottom: DimensionHelper.hp(1)
  },
  statusBadgeTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2
  },
  roleBottomRight: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2
  }
});
