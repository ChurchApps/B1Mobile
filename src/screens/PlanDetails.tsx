import { DimensionHelper } from '@churchapps/mobilehelper';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import { Loader, MainHeader, PositionDetails, Teams } from "../components";
import { ApiHelper, ArrayHelper, AssignmentInterface, Constants, PersonInterface, PlanInterface, PositionInterface, TimeInterface, UserHelper, globalStyles } from "../helpers";
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps,
  route : {
    params : {  id: string}
  }
}

export const PlanDetails  = (props: Props) => {
  console.log("props from planscreen------>", props?.route?.params?.id)
  const [plan, setPlan] = useState<PlanInterface | null>();
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [times, setTimes] = useState<TimeInterface[]>([]);
  const [people, setPeople] = useState<PersonInterface[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();
  
 useEffect(()=>{
 setErrorMessage('')
 }, [isFocused]) 
  
  const loadData = async () => {
    console.log("plan id exist or not------>", props?.route?.params?.id)
      setLoading(true);
      try{
          const tempPlan = await ApiHelper.get("/plans/" + props?.route?.params?.id, "DoingApi");
          console.log("temp plan", tempPlan)
          ApiHelper.get("/times/plan/" + props?.route?.params?.id, "DoingApi").then((data) => setTimes(data));
          setPlan(tempPlan);
          const tempPositions = await ApiHelper.get("/positions/plan/" + props?.route?.params?.id, "DoingApi");
          const tempAssignments = await ApiHelper.get("/assignments/plan/" + props?.route?.params?.id, "DoingApi");
          const peopleIds = ArrayHelper.getIds(tempAssignments, "personId");
          const tempPeople = await ApiHelper.get("/people/basic?ids=" + escape(peopleIds.join(",")), "MembershipApi");
          setPositions(tempPositions);
          setAssignments(tempAssignments);
          setPeople(tempPeople);
          setLoading(false);
        }catch(error) {
              console.log("Error loading Plan Details data:", error);
              setErrorMessage('No Data found for given Plan id')
          } finally {
            setLoading(false);
       } 
  };

  useEffect(() => { loadData() }, [props?.route?.params?.id]);
  
const getTeams = () => {
      const rows:JSX.Element[] = [];
      ArrayHelper.getUniqueValues(positions, "categoryName").forEach((category) => {
        const pos = ArrayHelper.getAll(positions, "categoryName", category);
        rows.push(<Teams positions={pos} assignments={assignments} people={people} name={category} />)
      });
      return rows;
    }

    const getPositionDetails = () => {
      const rows:JSX.Element[] = [];
      const myAssignments = ArrayHelper.getAll(assignments, "personId", UserHelper.currentUserChurch.person.id);
      myAssignments.forEach((assignment) => {
        const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
        const posTimes:TimeInterface[] = [];
        times?.forEach((time : any) => { if (time?.teams?.indexOf(position?.categoryName)>-1) posTimes.push(time); });
        rows.push(<PositionDetails position={position} assignment={assignment} times={posTimes} onUpdate={loadData}  />);
      });
      return rows;
    }

    const getNotes = () => {
      if (!plan?.notes) return null;
      return (
        <View style={[globalStyles.FlatlistViewStyle, {paddingTop: DimensionHelper.hp('2%')}]} key={plan.id} >
          <Text style={[globalStyles.LatestUpdateTextStyle, {paddingLeft: DimensionHelper.wp('3%') , color: Constants.Colors.app_color}]}>Notes</Text>
          <View style={{paddingTop : DimensionHelper.hp('1.5%')}}>
            <Text style={[globalStyles.planTextStyle, {paddingLeft: DimensionHelper.wp('3%')}]}>{plan.notes.replace("\n", "<br />")}</Text>
          </View>
          </View>
      ) 
    }
  
 return (
      <SafeAreaView style={globalStyles.homeContainer}>
          <MainHeader title={'Plan Details'} openDrawer={props.navigation.openDrawer} back={props.navigation.goBack}/>
          { isLoading ?  <Loader isLoading={isLoading} /> : 
          errorMessage  ? <View style={globalStyles.ErrorMessageView} >
          <Text style={globalStyles.searchMainText}>{errorMessage}</Text>
        </View> :
          <>
          <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} style={globalStyles.ScrollViewStyles} >
            {plan ?
              <View style={globalStyles.planTitleView}>
                <Icons name='assignment' size={DimensionHelper.wp('5.5%')} />
                <Text style={[globalStyles.LatestUpdateTextStyle, {paddingLeft: DimensionHelper.wp('3%')}]}>{plan?.name}</Text>
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