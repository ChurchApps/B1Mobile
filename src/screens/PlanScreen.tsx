import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import Icons from 'react-native-vector-icons/MaterialIcons';
import { BlockoutDates, Loader, MainHeader, ServingTimes, UpcomingDates } from "../components";
import { ApiHelper, ArrayHelper, AssignmentInterface, PlanInterface, PositionInterface, TimeInterface, UserSearchInterface, globalStyles } from "../helpers";
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps,
  route : {
    params : { userDetails : UserSearchInterface }
  }
}

export const PlanScreen   = (props: Props) => {
    const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
    const [positions, setPositions] = useState<PositionInterface[]>([]);
    const [plans, setPlans] = useState<PlanInterface[]>([]);
    const [times, setTimes] = useState<TimeInterface[]>([]);
    const [isLoading, setLoading] = useState(false);
   
    const loadData = async () => {
      setLoading(true)
      try{
          const tempAssignments:AssignmentInterface[] = await ApiHelper.get("/assignments/my", "DoingApi");
              console.log("my assignment data is ------>", tempAssignments)
          if (tempAssignments.length > 0) {
            setAssignments(tempAssignments);
            const positionIds = ArrayHelper.getUniqueValues(tempAssignments, "positionId");
            const tempPositions = await ApiHelper.get("/positions/ids?ids=" + positionIds, "DoingApi");
            if (tempPositions.length > 0) {
              setPositions(tempPositions);
              const planIds = ArrayHelper.getUniqueValues(tempPositions, "planId");
              ApiHelper.get("/plans/ids?ids=" + planIds, "DoingApi").then((data) => setPlans(data));
              ApiHelper.get("/times/plans?planIds=" + planIds, "DoingApi").then((data) => setTimes(data));
            }
          }
        }catch (error) {
            console.error("Error loading Plans data:", error);
          } finally {
              setLoading(false);
            } 
      };

    useEffect(() => { loadData() }, []);
 
    return (
        <SafeAreaView style={globalStyles.homeContainer}>
            <MainHeader title={'Plans'} openDrawer={props.navigation.openDrawer}/>
            { isLoading ?  <Loader isLoading={isLoading} /> : 
                <>
                  <ScrollView showsVerticalScrollIndicator={false} style={globalStyles.ScrollViewStyles}>
                  <View style={globalStyles.planTitleView}>
                  <Icons name='assignment' size={DimensionHelper.wp('5.5%')} />
                    <Text style={[globalStyles.LatestUpdateTextStyle, {paddingLeft: DimensionHelper.wp('3%')}]}>Plans</Text>
                  </View>
                  <ServingTimes assignments={assignments} positions={positions} plans={plans} navigation={props.navigation}/>
                  <UpcomingDates assignments={assignments} positions={positions} plans={plans} times={times}/>
                  <BlockoutDates/>
                  </ScrollView>
                </> 
              }
          </SafeAreaView>
      );
}