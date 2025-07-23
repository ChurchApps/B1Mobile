import React from "react";
import { PositionDetails } from "../../../../src/components/Plans/PositionDetails";
import { Teams } from "../../../../src/components/Plans/Teams";
import { ServiceOrder } from "../../../../src/components/Plans/ServiceOrder";
import { MainHeader } from "../../../../src/components/wrapper/MainHeader";
import { ArrayHelper, AssignmentInterface, PersonInterface, PlanInterface, PositionInterface, TimeInterface } from "../../../../src/helpers";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, DrawerActions } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { InlineLoader } from "../../../../src/components/common/LoadingComponents";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../../../src/stores/useUserStore";
import { Provider as PaperProvider, Card, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#F6F6F8",
    surface: "#FFFFFF",
    background: "#F6F6F8",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
    }
  }
};

const PlanDetails = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id;

  const [errorMessage, setErrorMessage] = useState("");
  const isFocused = useIsFocused();
  const [selectedTab, setSelectedTab] = useState<"overview" | "serviceOrder" | "teams">("overview");

  const currentUserChurch = useCurrentUserChurch();

  useEffect(() => {
    setErrorMessage("");
  }, [isFocused]);

  // Use react-query for plan details with faster loading
  const {
    data: plan,
    isLoading: planLoading,
    error: planError
  } = useQuery<PlanInterface>({
    queryKey: [`/plans/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: undefined,
    staleTime: 30 * 60 * 1000, // 30 minutes for faster subsequent loads
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });

  // Use react-query for plan times
  const { data: times = [], isLoading: timesLoading } = useQuery<TimeInterface[]>({
    queryKey: [`/times/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Use react-query for plan positions
  const { data: positions = [], isLoading: positionsLoading } = useQuery<PositionInterface[]>({
    queryKey: [`/positions/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Use react-query for plan assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentInterface[]>({
    queryKey: [`/assignments/plan/${planId}`, "DoingApi"],
    enabled: !!planId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - assignments change more frequently
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Extract people IDs from assignments
  const peopleIds = ArrayHelper.getIds(assignments, "personId");

  // Use react-query for people data - depends on assignments
  const { data: people = [], isLoading: peopleLoading } = useQuery<PersonInterface[]>({
    queryKey: [`/people/basic?ids=${escape(peopleIds.join(","))}`, "MembershipApi"],
    enabled: !!currentUserChurch?.jwt && assignments.length > 0 && peopleIds.length > 0,
    placeholderData: [],
    staleTime: 60 * 60 * 1000, // 1 hour - people data is very stable
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnWindowFocus: false
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

  // My assignments for prominent display
  const myAssignments = useMemo(() => ArrayHelper.getAll(assignments, "personId", currentUserChurch?.person?.id), [assignments, currentUserChurch?.person?.id]);

  const getPositionDetails = () =>
    myAssignments.filter(assignment => assignment?.id).map(assignment => {
      const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
      const posTimes = times?.filter((time: any) => time?.teams?.indexOf(position?.categoryName) > -1) || [];
      return <PositionDetails key={`position-${assignment.id}`} position={position} assignment={assignment} times={posTimes} onUpdate={loadData} />;
    });

  const renderOverviewSection = () => (
    <>
      {/* Hero Card */}
      <Card style={styles.overviewHeroCard}>
        {planLoading ? (
          <Card.Content style={styles.loadingCardContent}>
            <InlineLoader size="large" text="Loading plan details..." />
          </Card.Content>
        ) : plan ? (
          <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.overviewHeroGradient}>
            <View style={styles.overviewHeroContent}>
              <MaterialIcons name="assignment" size={48} color="white" style={styles.overviewHeroIcon} />
              <Text style={styles.overviewHeroTitle}>{plan.name}</Text>
              <Text style={styles.overviewHeroDate}>{plan.serviceDate ? new Date(plan.serviceDate).toLocaleDateString() : "TBD"}</Text>
            </View>
          </LinearGradient>
        ) : (
          <Card.Content style={styles.loadingCardContent}>
            <MaterialIcons name="error-outline" size={48} color="#9E9E9E" />
            <Text style={styles.errorCardText}>Plan not found</Text>
          </Card.Content>
        )}
      </Card>

      {/* My Position Details - Made Prominent */}
      <View style={styles.myPositionsSection}>
        <View style={styles.myPositionsHeader}>
          <MaterialIcons name="assignment-ind" size={24} color="#0D47A1" />
          <Text style={styles.myPositionsTitle}>My Assignments</Text>
          {!assignmentsLoading && (
            <View style={styles.assignmentCount}>
              <Text style={styles.assignmentCountText}>{myAssignments.length}</Text>
            </View>
          )}
        </View>
        
        {assignmentsLoading || positionsLoading || timesLoading ? (
          <Card style={styles.loadingCard}>
            <Card.Content style={styles.loadingCardContent}>
              <InlineLoader size="large" text="Loading assignments..." />
            </Card.Content>
          </Card>
        ) : myAssignments.length > 0 ? (
          getPositionDetails()
        ) : (
          <Card style={styles.noAssignmentsCard}>
            <Card.Content style={styles.noAssignmentsContent}>
              <MaterialIcons name="assignment-late" size={48} color="#9E9E9E" />
              <Text style={styles.noAssignmentsText}>No assignments for this plan</Text>
              <Text style={styles.noAssignmentsSubtext}>Check with your team leader if you expected to be assigned</Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Notes */}
      <Card style={styles.overviewNotesCard}>
        <Card.Content>
          <View style={styles.overviewNotesHeader}>
            <MaterialIcons name="note" size={24} color="#0D47A1" />
            <Text style={styles.overviewNotesTitle}>Plan Notes</Text>
          </View>
          {planLoading ? (
            <InlineLoader text="Loading notes..." />
          ) : plan?.notes ? (
            <Text style={styles.overviewNotesText}>{plan.notes.replace(/\n/g, " ")}</Text>
          ) : (
            <Text style={styles.noNotesText}>No notes available for this plan</Text>
          )}
        </Card.Content>
      </Card>
    </>
  );

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0D47A1" />
      <Text style={styles.loadingText}>Loading plan details...</Text>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <MainHeader title="Plan Details" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, selectedTab === "overview" && styles.activeTab]} onPress={() => setSelectedTab("overview")}>
              <Text style={[styles.tabText, selectedTab === "overview" && styles.activeTabText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, selectedTab === "serviceOrder" && styles.activeTab]} onPress={() => setSelectedTab("serviceOrder")}>
              <Text style={[styles.tabText, selectedTab === "serviceOrder" && styles.activeTabText]}>Service Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, selectedTab === "teams" && styles.activeTab]} onPress={() => setSelectedTab("teams")}>
              <Text style={[styles.tabText, selectedTab === "teams" && styles.activeTabText]}>Teams</Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#B0120C" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {selectedTab === "overview" && renderOverviewSection()}
              {selectedTab === "serviceOrder" && (
                <View style={styles.contentSection}>
                  <Card style={styles.serviceOrderCard}>
                    <Card.Content>
                      <View style={styles.sectionHeader}>
                        <MaterialIcons name="format-list-numbered" size={24} color="#0D47A1" />
                        <Text style={styles.sectionTitle}>Service Order</Text>
                      </View>
                      {planLoading ? (
                        <InlineLoader size="large" text="Loading service order..." />
                      ) : plan ? (
                        <ServiceOrder plan={plan} />
                      ) : (
                        <Text style={styles.noDataText}>Service order not available</Text>
                      )}
                    </Card.Content>
                  </Card>
                </View>
              )}
              {selectedTab === "teams" && (
                <View style={styles.contentSection}>
                  {assignmentsLoading || positionsLoading || peopleLoading ? (
                    <Card style={styles.loadingCard}>
                      <Card.Content style={styles.loadingCardContent}>
                        <InlineLoader size="large" text="Loading teams..." />
                      </Card.Content>
                    </Card>
                  ) : (
                    getTeams()
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomColor: "#0D47A1"
  },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500",
    fontSize: 14
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
  },

  // Content
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },
  contentSection: {
    marginBottom: 16
  },

  // Loading Indicator
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 200
  },
  loadingText: {
    color: "#9E9E9E",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center"
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  errorText: {
    color: "#B0120C",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 16
  },

  // Overview Section
  overviewHeroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  overviewHeroGradient: {
    padding: 24,
    minHeight: 140
  },
  overviewHeroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  overviewHeroIcon: {
    marginBottom: 12
  },
  overviewHeroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  overviewHeroDate: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.9,
    fontWeight: "500"
  },

  // My Positions Section - Prominent Display
  myPositionsSection: {
    marginBottom: 24
  },
  myPositionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(21, 101, 192, 0.08)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  myPositionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D47A1",
    flex: 1,
    marginLeft: 8
  },
  assignmentCount: {
    backgroundColor: "#0D47A1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: "center"
  },
  assignmentCountText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700"
  },

  // No Assignments Card
  noAssignmentsCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 24
  },
  noAssignmentsContent: {
    alignItems: "center",
    padding: 32
  },
  noAssignmentsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginTop: 16,
    textAlign: "center"
  },
  noAssignmentsSubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20
  },

  // Notes
  overviewNotesCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16
  },
  overviewNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  overviewNotesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginLeft: 8
  },
  overviewNotesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20
  },

  // Loading States
  loadingCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16
  },
  loadingCardContent: {
    alignItems: "center",
    padding: 40
  },
  errorCardText: {
    fontSize: 16,
    color: "#9E9E9E",
    marginTop: 12,
    textAlign: "center"
  },
  noNotesText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontStyle: "italic"
  },
  noDataText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    padding: 20,
    fontStyle: "italic"
  },

  // Section Headers
  serviceOrderCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3c3c3c",
    marginLeft: 8
  }
});

export default PlanDetails;
