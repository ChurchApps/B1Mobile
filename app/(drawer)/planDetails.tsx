import { Loader } from "@/src/components/Loader";
import { PositionDetails } from "@/src/components/Plans/PositionDetails";
import { Teams } from "@/src/components/Plans/Teams";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, ArrayHelper, AssignmentInterface, Constants, PersonInterface, PlanInterface, PositionInterface, TimeInterface, UserHelper, globalStyles } from "@/src/helpers";
import { NavigationProps } from '@/src/interfaces';
import { DimensionHelper } from '@churchapps/mobilehelper';
import Icons from '@expo/vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

interface Props {
  navigation: NavigationProps,
  route: {
    params: { id: string }
  }
}

const PlanDetails = (props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: any }>();
  const planId = JSON.parse(id)

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
      console.log("temp plan", tempPlan)
      ApiHelper.get("/times/plan/" + planId, "DoingApi").then((data) => setTimes(data));
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
    const rows: JSX.Element[] = [];
    ArrayHelper.getUniqueValues(positions, "categoryName").forEach((category) => {
      const pos = ArrayHelper.getAll(positions, "categoryName", category);
      rows.push(<Teams positions={pos} assignments={assignments} people={people} name={category} />)
    });
    return rows;
  }

  const getPositionDetails = () => {
    const rows: JSX.Element[] = [];
    const myAssignments = ArrayHelper.getAll(assignments, "personId", UserHelper.currentUserChurch.person.id);
    myAssignments.forEach((assignment) => {
      const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
      const posTimes: TimeInterface[] = [];
      times?.forEach((time: any) => { if (time?.teams?.indexOf(position?.categoryName) > -1) posTimes.push(time); });
      rows.push(<PositionDetails position={position} assignment={assignment} times={posTimes} onUpdate={loadData} />);
    });
    return rows;
  }

  const getNotes = () => {
    if (!plan?.notes) return null;
    return (
      <View style={[globalStyles.FlatlistViewStyle, { paddingTop: DimensionHelper.hp('2%') }]} key={plan.id} >
        <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp('3%'), color: Constants.Colors.app_color }]}>Notes</Text>
        <View style={{ paddingTop: DimensionHelper.hp('1.5%') }}>
          <Text style={[globalStyles.planTextStyle, { paddingLeft: DimensionHelper.wp('3%') }]}>{plan.notes.replace("\n", "<br />")}</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={'Plan Details'} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      {isLoading ? <Loader isLoading={isLoading} /> :
        errorMessage ? <View style={globalStyles.ErrorMessageView} >
          <Text style={globalStyles.searchMainText}>{errorMessage}</Text>
        </View> :
          <>
            <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} style={globalStyles.ScrollViewStyles} >
              {plan ?
                <View style={globalStyles.planTitleView}>
                  <Icons name='assignment' size={DimensionHelper.wp('5.5%')} />
                  <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp('3%') }]}>{plan?.name}</Text>
                </View> : null}
              <View>
                {getPositionDetails()}
                {getNotes()}
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


export default PlanDetails
