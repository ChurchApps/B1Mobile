import React from 'react';
import { Loader } from "@/src/components/Loader";
import { BlockoutDates } from "@/src/components/Plans/BlockoutDates";
import { ServingTimes } from "@/src/components/Plans/ServingTimes";
import { UpcomingDates } from "@/src/components/Plans/UpcomingDates";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, ArrayHelper, globalStyles } from "@/src/helpers"; // Constants removed
import { AssignmentInterface, PlanInterface, PositionInterface, TimeInterface, UserSearchInterface } from "@/src/helpers/Interfaces"; // UserSearchInterface unused
import { NavigationProps } from "@/src/interfaces"; // Unused
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
// Icons from @expo/vector-icons/MaterialIcons replaced by Paper.Icon
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from 'expo-router'; // useNavigation from expo-router for Drawer
import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native"; // Text, Animated removed
import { ScrollView } from 'react-native-gesture-handler';
import { Text as PaperText, useTheme, Icon as PaperIcon, Surface } from 'react-native-paper';


// interface Props { // Unused Props
//   navigation: NavigationProps,
//   route: {
//     params: { userDetails: UserSearchInterface }
//   }
// }

const Plan = () => { // Removed props: Props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [plans, setPlans] = useState<PlanInterface[]>([]);
  const [times, setTimes] = useState<TimeInterface[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const tempAssignments: AssignmentInterface[] = await ApiHelper.get("/assignments/my", "DoingApi");
      if (tempAssignments.length > 0) {
        setAssignments(tempAssignments);
        const positionIds = ArrayHelper.getUniqueValues(tempAssignments, "positionId");
        if (positionIds.length > 0) { // Check if positionIds exist
          const tempPositions = await ApiHelper.get("/positions/ids?ids=" + positionIds.join(','), "DoingApi"); // Join IDs correctly
          if (tempPositions.length > 0) {
            setPositions(tempPositions);
            const planIds = ArrayHelper.getUniqueValues(tempPositions, "planId");
            if (planIds.length > 0) { // Check if planIds exist
              const [tempPlans, tempTimes] = await Promise.all([
                ApiHelper.get("/plans/ids?ids=" + planIds.join(','), "DoingApi"), // Join IDs
                ApiHelper.get("/times/plans?planIds=" + planIds.join(','), "DoingApi") // Join IDs
              ]);
              setPlans(tempPlans || []); // Ensure array
              setTimes(tempTimes || []); // Ensure array
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading Plans data:", error);
      // Optionally set an error state to display to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const localStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background, // from globalStyles.homeContainer and styles.container
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: DimensionHelper.hp(4),
    },
    headerSurface: { // Replaces headerGradient View
      backgroundColor: theme.colors.primary, // from Constants.Colors.app_color
      paddingVertical: DimensionHelper.hp(2),
      marginBottom: DimensionHelper.hp(2),
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      elevation: 4, // Standard Paper elevation for this kind of surface
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: DimensionHelper.wp(5),
    },
    headerTitle: {
      // fontSize: DimensionHelper.wp(5), // Use variant
      // fontWeight: '600', // Use variant
      color: theme.colors.onPrimary, // Was 'white'
      marginLeft: DimensionHelper.wp(3),
    },
    contentContainer: {
      paddingHorizontal: DimensionHelper.wp(4),
    },
  });

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <MainHeader title={'Plans'} openDrawer={navigation.openDrawer} />
      {isLoading ? <Loader isLoading={isLoading} /> : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={localStyles.scrollView}
          contentContainerStyle={localStyles.scrollContent}
        >
          <Surface style={localStyles.headerSurface} elevation={4}>
            <View style={localStyles.headerContent}>
              <PaperIcon source='assignment-ind' size={DimensionHelper.wp(6)} color={theme.colors.onPrimary} />
              <PaperText variant="headlineSmall" style={localStyles.headerTitle}>My Plans</PaperText>
            </View>
          </Surface>

          <View style={localStyles.contentContainer}>
            <ServingTimes assignments={assignments} positions={positions} plans={plans} navigation={navigation} />
            <UpcomingDates assignments={assignments} positions={positions} plans={plans} times={times} navigation={navigation} />
            <BlockoutDates />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default Plan;
