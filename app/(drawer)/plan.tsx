import React, { useMemo } from "react";
import { 
  BlockoutDates, 
  ServingTimes, 
  UpcomingDates 
} from "../../src/components/Plans/LazyPlanComponents";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { ArrayHelper } from "@/helpers/index";
import { AssignmentInterface, PlanInterface, PositionInterface, TimeInterface } from "@/helpers/Interfaces";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { Provider as PaperProvider, Card, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
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

const Plan = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for assignments - this is the starting point
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentInterface[]>({
    queryKey: ["/assignments/my", "DoingApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Extract position IDs from assignments
  const positionIds = ArrayHelper.getUniqueValues(assignments, "positionId");

  // Use react-query for positions - depends on assignments
  const { data: positions = [], isLoading: positionsLoading } = useQuery<PositionInterface[]>({
    queryKey: ["/positions/ids?ids=" + positionIds, "DoingApi"],
    enabled: !!currentUserChurch?.jwt && assignments.length > 0 && positionIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - positions change less frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Extract plan IDs from positions
  const planIds = ArrayHelper.getUniqueValues(positions, "planId");

  // Use react-query for plans - depends on positions
  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanInterface[]>({
    queryKey: ["/plans/ids?ids=" + planIds, "DoingApi"],
    enabled: !!currentUserChurch?.jwt && positions.length > 0 && planIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use react-query for times - depends on positions (same planIds)
  const { data: times = [], isLoading: timesLoading } = useQuery<TimeInterface[]>({
    queryKey: ["/times/plans?planIds=" + planIds, "DoingApi"],
    enabled: !!currentUserChurch?.jwt && positions.length > 0 && planIds.length > 0,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const isLoading = assignmentsLoading || positionsLoading || plansLoading || timesLoading;

  // Filter plans to only show upcoming ones
  const upcomingPlans = useMemo(() => plans.filter(p => p.serviceDate && new Date(p.serviceDate) >= new Date()), [plans]);

  // Filter assignments to only those for upcoming plans
  const upcomingAssignments = useMemo(() => {
    const upcomingPlanIds = upcomingPlans.map(p => p.id);
    return assignments.filter(a => {
      const position = positions.find(p => p.id === a.positionId);
      return position && upcomingPlanIds.includes(position.planId);
    });
  }, [assignments, positions, upcomingPlans]);

  // Statistics for summary cards
  const planStats = useMemo(() => {
    const requestedCount = upcomingAssignments.length;
    const confirmedCount = upcomingAssignments.filter(a => a.status === "Confirmed" || a.status === "Accepted").length;
    const pendingCount = upcomingAssignments.filter(a => !a.status || a.status === "Unconfirmed" || a.status === "Pending").length;
    const nextPlan = upcomingPlans.sort((a, b) => new Date(a.serviceDate!).getTime() - new Date(b.serviceDate!).getTime())[0];

    return {
      requested: requestedCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      nextPlan
    };
  }, [upcomingAssignments, upcomingPlans]);

  const renderHeroSection = () => (
    <Card style={styles.heroCard}>
      <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
        <View style={styles.heroContent}>
          <MaterialIcons name="assignment" size={48} color="white" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Your Serving Schedule</Text>
          <Text style={styles.heroSubtitle}>
            {planStats.confirmed} confirmed • {planStats.pending} pending
          </Text>
          {planStats.nextPlan && (
            <View style={styles.nextPlanContainer}>
              <Text style={styles.nextPlanLabel}>Next Service:</Text>
              <Text style={styles.nextPlanDate}>{new Date(planStats.nextPlan.serviceDate).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <MaterialIcons name="assignment" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{planStats.requested}</Text>
          <Text style={styles.statLabel}>Requested</Text>
        </Card.Content>
      </Card>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <MaterialIcons name="event-available" size={32} color="#70DC87" />
          <Text style={styles.statNumber}>{planStats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </Card.Content>
      </Card>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <MaterialIcons name="schedule" size={32} color="#FEAA24" />
          <Text style={styles.statNumber}>{planStats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.container}>
            <MainHeader title="Plans" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />
            <View style={styles.contentContainer}>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!isLoading && (
                  <>
                    {renderHeroSection()}
                    {renderStatsCards()}
                    <ServingTimes assignments={upcomingAssignments} positions={positions} plans={upcomingPlans} navigation={navigation} />
                    <UpcomingDates assignments={upcomingAssignments} positions={positions} plans={upcomingPlans} times={times} navigation={navigation} />
                    <BlockoutDates />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </LoadingWrapper>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },

  // Hero Section
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 24,
    minHeight: 180
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroIcon: {
    marginBottom: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center"
  },
  heroSubtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 16
  },
  nextPlanContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center"
  },
  nextPlanLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4
  },
  nextPlanDate: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  statContent: {
    alignItems: "center",
    padding: 16
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3c3c3c",
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
    textAlign: "center"
  }
});

export default Plan;
