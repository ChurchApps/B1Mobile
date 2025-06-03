import React from 'react';
import { Loader } from "@/src/components/Loader";
import { PositionDetails } from "@/src/components/Plans/PositionDetails";
import { Teams } from "@/src/components/Plans/Teams";
import { ServiceOrder } from "@/src/components/Plans/ServiceOrder";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, ArrayHelper, AssignmentInterface, Constants, PersonInterface, PlanInterface, PositionInterface, TimeInterface, UserHelper, globalStyles } from "@/src/helpers";
import { NavigationProps } from '@/src/interfaces';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import Icons from '@expo/vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';

interface Props {
  navigation: NavigationProps
}

const PlanDetails = (props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id;  // No need to JSON.parse since it's a URL parameter

  // console.log("props from planscreen------>", props?.route?.params?.id)
  const [plan, setPlan] = useState<PlanInterface | null>();
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [times, setTimes] = useState<TimeInterface[]>([]);
  const [people, setPeople] = useState<PersonInterface[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();


  useEffect(() => {
    setErrorMessage('')
  }, [isFocused])

  const loadData = async () => {
    // console.log("plan id exist or not------>", props?.route?.params?.id)
    setLoading(true);
    try {
      const tempPlan = await ApiHelper.get("/plans/" + planId, "DoingApi");
      ApiHelper.get("/times/plan/" + planId, "DoingApi").then((data) => { setTimes(data); });
      setPlan(tempPlan);
      const tempPositions = await ApiHelper.get("/positions/plan/" + planId, "DoingApi");
      const tempAssignments = await ApiHelper.get("/assignments/plan/" + planId, "DoingApi");
      const peopleIds = ArrayHelper.getIds(tempAssignments, "personId");
      const tempPeople = await ApiHelper.get("/people/basic?ids=" + escape(peopleIds.join(",")), "MembershipApi");
      setPositions(tempPositions);
      setAssignments(tempAssignments);
      setPeople(tempPeople);
      setLoading(false);
    } catch (error) {
      console.log("Error loading Plan Details data:", error);
      setErrorMessage('No Data found for given Plan id')
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData() }, [planId]);

  const getTeams = () => {
    return ArrayHelper.getUniqueValues(positions, "categoryName").map((category) => {
      const pos = ArrayHelper.getAll(positions, "categoryName", category);
      return <Teams
        key={`team-${category.toLowerCase().replace(/\s+/g, '-')}`}
        positions={pos}
        assignments={assignments}
        people={people}
        name={category}
      />;
    });
  }

  const getPositionDetails = () => {
    const myAssignments = ArrayHelper.getAll(assignments, "personId", UserHelper.currentUserChurch.person.id);
    return myAssignments.map((assignment) => {
      const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
      const posTimes = times?.filter((time: any) => time?.teams?.indexOf(position?.categoryName) > -1) || [];
      return <PositionDetails
        key={`position-${assignment.id}`}
        position={position}
        assignment={assignment}
        times={posTimes}
        onUpdate={loadData}
      />;
    });
  }

  const getNotes = () => {
    if (!plan?.notes) return null;
    return (
      <View style={[globalStyles.FlatlistViewStyle, { paddingTop: DimensionHelper.hp(2) }]} key={plan.id} >
        <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>Notes</Text>
        <View style={{ paddingTop: DimensionHelper.hp(1.5) }}>
          <Text style={[globalStyles.planTextStyle, { paddingLeft: DimensionHelper.wp(3) }]}>{plan.notes.replace("\n", "<br />")}</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={'Plan Details'} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      {plan && (
        <View style={[styles.headerGradient, { backgroundColor: Constants.Colors.app_color }]}>
          <View style={styles.headerContent}>
            <Icons name='assignment' size={DimensionHelper.wp(6)} color="white" />
            <Text style={styles.headerTitle}>{plan?.name}</Text>
          </View>
        </View>
      )}
      {isLoading ? <Loader isLoading={isLoading} /> :
        errorMessage ? <View style={globalStyles.ErrorMessageView} >
          <Text style={globalStyles.searchMainText}>{errorMessage}</Text>
        </View> :
          <>
            <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} style={globalStyles.ScrollViewStyles} >
              <View>
                {getPositionDetails()}
                {getNotes()}
                {plan && <ServiceOrder plan={plan} />}
              </View>
              <ScrollView nestedScrollEnabled={true} style={globalStyles.ScrollViewStyles}>
                <View style={globalStyles.ErrorMessageView}>
                  {getTeams()}
                </View>
              </ScrollView>
            </ScrollView>
          </>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingVertical: DimensionHelper.hp(2),
    marginBottom: DimensionHelper.hp(2),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DimensionHelper.wp(5),
  },
  headerTitle: {
    fontSize: DimensionHelper.wp(5),
    fontWeight: '600',
    color: 'white',
    marginLeft: DimensionHelper.wp(3),
  },
});

export default PlanDetails
