import React from "react";
import { Loader } from "../../src/components/Loader";
import { BlockoutDates } from "../../src/components/Plans/BlockoutDates";
import { ServingTimes } from "../../src/components/Plans/ServingTimes";
import { UpcomingDates } from "../../src/components/Plans/UpcomingDates";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { ArrayHelper, globalStyles, Constants, UserHelper } from "../../src/helpers";
import { AssignmentInterface, PlanInterface, PositionInterface, TimeInterface } from "../../src/helpers/Interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";

const Plan = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  // Use react-query for assignments - this is the starting point
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentInterface[]>({
    queryKey: ["/assignments/my", "DoingApi"],
    enabled: !!UserHelper.user?.jwt,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Extract position IDs from assignments
  const positionIds = ArrayHelper.getUniqueValues(assignments, "positionId");

  // Use react-query for positions - depends on assignments
  const { data: positions = [], isLoading: positionsLoading } = useQuery<PositionInterface[]>({
    queryKey: ["/positions/ids?ids=" + positionIds, "DoingApi"],
    enabled: !!UserHelper.user?.jwt && assignments.length > 0 && positionIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - positions change less frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Extract plan IDs from positions
  const planIds = ArrayHelper.getUniqueValues(positions, "planId");

  // Use react-query for plans - depends on positions
  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanInterface[]>({
    queryKey: ["/plans/ids?ids=" + planIds, "DoingApi"],
    enabled: !!UserHelper.user?.jwt && positions.length > 0 && planIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for times - depends on positions (same planIds)
  const { data: times = [], isLoading: timesLoading } = useQuery<TimeInterface[]>({
    queryKey: ["/times/plans?planIds=" + planIds, "DoingApi"],
    enabled: !!UserHelper.user?.jwt && positions.length > 0 && planIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const isLoading = assignmentsLoading || positionsLoading || plansLoading || timesLoading;

  return (
    <SafeAreaView style={[globalStyles.homeContainer, styles.container]}>
      <MainHeader title={"Plans"} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      {isLoading ? (
        <Loader isLoading={isLoading} />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.headerGradient, { backgroundColor: Constants.Colors.app_color }]}>
              <View style={styles.headerContent}>
                <Icons name="assignment" size={DimensionHelper.wp(6)} color="white" />
                <Text style={styles.headerTitle}>My Plans</Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <ServingTimes assignments={assignments} positions={positions} plans={plans} navigation={navigation} />
              <UpcomingDates assignments={assignments} positions={positions} plans={plans} times={times} navigation={navigation} />
              <BlockoutDates />
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5"
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: DimensionHelper.hp(4)
  },
  headerGradient: {
    paddingVertical: DimensionHelper.hp(2),
    marginBottom: DimensionHelper.hp(2),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DimensionHelper.wp(5)
  },
  headerTitle: {
    fontSize: DimensionHelper.wp(5),
    fontWeight: "600",
    color: "white",
    marginLeft: DimensionHelper.wp(3)
  },
  contentContainer: {
    paddingHorizontal: DimensionHelper.wp(4)
  }
});

export default Plan;
