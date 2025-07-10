import React from "react";
import { Loader } from "../../../../src/components/Loader";
import { PositionDetails } from "../../../../src/components/Plans/PositionDetails";
import { Teams } from "../../../../src/components/Plans/Teams";
import { ServiceOrder } from "../../../../src/components/Plans/ServiceOrder";
import { MainHeader } from "../../../../src/components/wrapper/MainHeader";
import { ArrayHelper, AssignmentInterface, Constants, PersonInterface, PlanInterface, PositionInterface, TimeInterface, globalStyles } from "../../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, DrawerActions } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../../../src/stores/useUserStore";

const PlanDetails = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id; // No need to JSON.parse since it's a URL parameter

  const [errorMessage, setErrorMessage] = useState("");
  const isFocused = useIsFocused();
  const [selectedTab, setSelectedTab] = useState<"serviceOrder" | "teams">("serviceOrder");

  const currentUserChurch = useCurrentUserChurch();

  useEffect(() => {
    setErrorMessage("");
  }, [isFocused]);

  // Use react-query for plan details
  const {
    data: plan,
    isLoading: planLoading,
    error: planError
  } = useQuery<PlanInterface>({
    queryKey: [`/plans/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for plan times
  const { data: times = [], isLoading: timesLoading } = useQuery<TimeInterface[]>({
    queryKey: [`/times/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for plan positions
  const { data: positions = [], isLoading: positionsLoading } = useQuery<PositionInterface[]>({
    queryKey: [`/positions/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for plan assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentInterface[]>({
    queryKey: [`/assignments/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes - assignments change more frequently
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Extract people IDs from assignments
  const peopleIds = ArrayHelper.getIds(assignments, "personId");

  // Use react-query for people data - depends on assignments
  const { data: people = [], isLoading: peopleLoading } = useQuery<PersonInterface[]>({
    queryKey: [`/people/basic?ids=${escape(peopleIds.join(","))}`, "MembershipApi"],
    enabled: !!currentUserChurch?.jwt && assignments.length > 0 && peopleIds.length > 0,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - people data is relatively stable
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  const isLoading = planLoading || timesLoading || positionsLoading || assignmentsLoading || peopleLoading;

  useEffect(() => {
    if (planError) {
      console.error("Error loading Plan Details data:", planError);
      setErrorMessage("No Data found for given Plan id");
    }
  }, [planError]);

  const getTeams = () =>
    ArrayHelper.getUniqueValues(positions, "categoryName").map(category => {
      const pos = ArrayHelper.getAll(positions, "categoryName", category);
      return <Teams key={`team-${category.toLowerCase().replace(/\s+/g, "-")}`} positions={pos} assignments={assignments} people={people} name={category} />;
    });

  const loadData = () => {
    // Data is managed by react-query and refetched automatically
    // This function is kept for component compatibility
  };

  const getPositionDetails = () => {
    const myAssignments = ArrayHelper.getAll(assignments, "personId", currentUserChurch?.person?.id);
    return myAssignments.map(assignment => {
      const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
      const posTimes = times?.filter((time: any) => time?.teams?.indexOf(position?.categoryName) > -1) || [];
      return <PositionDetails key={`position-${assignment.id}`} position={position} assignment={assignment} times={posTimes} onUpdate={loadData} />;
    });
  };

  const getNotes = () => {
    if (!plan?.notes) return null;
    return (
      <View style={[globalStyles.FlatlistViewStyle, { paddingTop: DimensionHelper.hp(2) }]} key={plan.id}>
        <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>Notes</Text>
        <View style={{ paddingTop: DimensionHelper.hp(1.5) }}>
          <Text style={[globalStyles.planTextStyle, { paddingLeft: DimensionHelper.wp(3) }]}>{plan.notes.replace("\n", "<br />")}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={"Plan Details"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />
      {plan && (
        <View style={[styles.headerGradient, { backgroundColor: Constants.Colors.app_color }]}>
          <View style={styles.headerContent}>
            <Icons name="assignment" size={DimensionHelper.wp(6)} color="white" />
            <Text style={styles.headerTitle}>{plan?.name}</Text>
          </View>
        </View>
      )}
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, selectedTab === "serviceOrder" && styles.activeTab]} onPress={() => setSelectedTab("serviceOrder")}>
          <Text style={[styles.tabText, selectedTab === "serviceOrder" && styles.activeTabText]}>Service Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === "teams" && styles.activeTab]} onPress={() => setSelectedTab("teams")}>
          <Text style={[styles.tabText, selectedTab === "teams" && styles.activeTabText]}>Teams</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <Loader isLoading={isLoading} />
      ) : errorMessage ? (
        <View style={globalStyles.ErrorMessageView}>
          <Text style={globalStyles.searchMainText}>{errorMessage}</Text>
        </View>
      ) : (
        <>
          <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} style={globalStyles.ScrollViewStyles}>
            <View>
              {getPositionDetails()}
              {getNotes()}
              {selectedTab === "serviceOrder" && plan && <ServiceOrder plan={plan} />}
              {selectedTab === "teams" && (
                <ScrollView nestedScrollEnabled={true} style={globalStyles.ScrollViewStyles}>
                  <View style={globalStyles.ErrorMessageView}>{getTeams()}</View>
                </ScrollView>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    marginHorizontal: DimensionHelper.wp(4),
    marginBottom: DimensionHelper.hp(1),
    marginTop: -DimensionHelper.hp(1),
    overflow: "hidden"
  },
  tab: {
    flex: 1,
    paddingVertical: DimensionHelper.hp(1.2),
    alignItems: "center",
    backgroundColor: "transparent"
  },
  activeTab: {
    backgroundColor: Constants.Colors.app_color
  },
  tabText: {
    color: Constants.Colors.Dark_Gray,
    fontSize: DimensionHelper.wp(4),
    fontWeight: "500"
  },
  activeTabText: {
    color: "white",
    fontWeight: "700"
  }
});

export default PlanDetails;
