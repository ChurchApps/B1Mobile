import React from "react";
import { Loader } from "../../src/components/Loader";
import { BlockoutDates } from "../../src/components/Plans/BlockoutDates";
import { ServingTimes } from "../../src/components/Plans/ServingTimes";
import { UpcomingDates } from "../../src/components/Plans/UpcomingDates";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { ApiHelper, ArrayHelper, globalStyles, Constants } from "../../src/helpers";
import { AssignmentInterface, PlanInterface, PositionInterface, TimeInterface } from "../../src/helpers/Interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const Plan = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [plans, setPlans] = useState<PlanInterface[]>([]);
  const [times, setTimes] = useState<TimeInterface[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadData = async () => {
    console.log("LOAD DATA");
    setLoading(true);
    try {
      const tempAssignments: AssignmentInterface[] = await ApiHelper.get("/assignments/my", "DoingApi");
      if (tempAssignments.length > 0) {
        setAssignments(tempAssignments);
        const positionIds = ArrayHelper.getUniqueValues(tempAssignments, "positionId");
        const tempPositions = await ApiHelper.get("/positions/ids?ids=" + positionIds, "DoingApi");
        if (tempPositions.length > 0) {
          setPositions(tempPositions);
          const planIds = ArrayHelper.getUniqueValues(tempPositions, "planId");
          const [tempPlans, tempTimes] = await Promise.all([ApiHelper.get("/plans/ids?ids=" + planIds, "DoingApi"), ApiHelper.get("/times/plans?planIds=" + planIds, "DoingApi")]);
          setPlans(tempPlans);
          setTimes(tempTimes);
        }
      }
    } catch (error) {
      console.error("Error loading Plans data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
