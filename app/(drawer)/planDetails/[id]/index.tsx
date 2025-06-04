import React from 'react';
import { Loader } from "@/src/components/Loader";
import { PositionDetails } from "@/src/components/Plans/PositionDetails";
import { Teams } from "@/src/components/Plans/Teams";
import { ServiceOrder } from "@/src/components/Plans/ServiceOrder";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, ArrayHelper, AssignmentInterface, PersonInterface, PlanInterface, PositionInterface, TimeInterface, UserHelper, globalStyles } from "@/src/helpers"; // Constants removed
import { NavigationProps } from '@/src/interfaces'; // Unused
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
// Icons from @expo/vector-icons/MaterialIcons replaced by Paper.Icon
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native'; // Text, TouchableOpacity removed
import { Text as PaperText, useTheme, Icon as PaperIcon, Surface, Button as PaperButton, SegmentedButtons, Card } from 'react-native-paper';

// interface Props { // Unused
//   navigation: NavigationProps;
// }

const PlanDetails = () => { // Removed props
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id;

  const [plan, setPlan] = useState<PlanInterface | null>(null); // Initialized to null
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInterface[]>([]);
  const [times, setTimes] = useState<TimeInterface[]>([]);
  const [people, setPeople] = useState<PersonInterface[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();
  const [selectedTab, setSelectedTab] = useState<'serviceOrder' | 'teams'>('serviceOrder');

  useEffect(() => { setErrorMessage(''); }, [isFocused]);

  const loadData = async () => {
    if (!planId) {
      setErrorMessage('Plan ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const tempPlan = await ApiHelper.get("/plans/" + planId, "DoingApi");
      if (!tempPlan) {
        setErrorMessage('Plan not found.');
        setPlan(null);
        setLoading(false);
        return;
      }
      setPlan(tempPlan);
      // Chain dependent fetches or use Promise.all more carefully
      ApiHelper.get("/times/plan/" + planId, "DoingApi").then((data) => { setTimes(data || []); });
      const tempPositions = await ApiHelper.get("/positions/plan/" + planId, "DoingApi");
      setPositions(tempPositions || []);
      const tempAssignments = await ApiHelper.get("/assignments/plan/" + planId, "DoingApi");
      setAssignments(tempAssignments || []);
      if ((tempAssignments || []).length > 0) {
        const peopleIds = ArrayHelper.getIds(tempAssignments, "personId");
        if (peopleIds.length > 0) {
          const tempPeople = await ApiHelper.get("/people/basic?ids=" + escape(peopleIds.join(",")), "MembershipApi");
          setPeople(tempPeople || []);
        } else {
          setPeople([]);
        }
      } else {
        setPeople([]);
      }
    } catch (error) {
      console.log("Error loading Plan Details data:", error);
      setErrorMessage('Error loading plan data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [planId]);

  const getTeamsDisplay = () => { // Renamed getTeams
    return ArrayHelper.getUniqueValues(positions, "categoryName").map((category) => {
      const pos = ArrayHelper.getAll(positions, "categoryName", category);
      return <Teams key={`team-${category.toLowerCase().replace(/\s+/g, '-')}`} positions={pos} assignments={assignments} people={people} name={category} />;
    });
  };

  const getPositionDetailsDisplay = () => { // Renamed getPositionDetails
    if (!UserHelper.currentUserChurch?.person?.id) return null; // Guard
    const myAssignments = ArrayHelper.getAll(assignments, "personId", UserHelper.currentUserChurch.person.id);
    return myAssignments.map((assignment) => {
      const position = ArrayHelper.getOne(positions, "id", assignment.positionId);
      const posTimes = times?.filter((time: any) => time?.teams?.includes(position?.categoryName)) || []; // Use includes
      return <PositionDetails key={`position-${assignment.id}`} position={position} assignment={assignment} times={posTimes} onUpdate={loadData} />;
    });
  };

  const getNotesDisplay = () => { // Renamed getNotes
    if (!plan?.notes) return null;
    return (
      <Card style={localStyles.notesCard} elevation={2}>
        <Card.Title title="Notes" titleStyle={{color: theme.colors.primary}} />
        <Card.Content>
          <PaperText variant="bodyMedium" style={{color: theme.colors.onSurface}}>{plan.notes.replace(/\n/g, "\n")}</PaperText> {/* Keep \n for PaperText */}
        </Card.Content>
      </Card>
    );
  };

  const localStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    headerSurface: { backgroundColor: theme.colors.primary, paddingVertical: DimensionHelper.hp(2), marginBottom: DimensionHelper.hp(2), borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 4 },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: DimensionHelper.wp(5) },
    headerTitle: { color: theme.colors.onPrimary, marginLeft: DimensionHelper.wp(3) },
    segmentedButtonContainer: { paddingHorizontal: DimensionHelper.wp(4), marginBottom: DimensionHelper.hp(1) },
    // TabBar styles are replaced by SegmentedButtons
    contentScrollView: { ...globalStyles.ScrollViewStyles, flex:1 }, // Ensure ScrollView takes space
    errorMessageView: { ...globalStyles.ErrorMessageView, flex:1, justifyContent:'center', alignItems:'center', padding: theme.spacing?.md },
    errorMessageText: { ...globalStyles.searchMainText, color: theme.colors.error },
    notesCard: { margin: DimensionHelper.wp(4), backgroundColor: theme.colors.surfaceVariant },
    teamsScrollViewContainer: { ...globalStyles.ErrorMessageView, padding: 0 } // Assuming ErrorMessageView was for padding/centering
  });

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <MainHeader title={'Plan Details'} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      {plan && (
        <Surface style={localStyles.headerSurface} elevation={4}>
          <View style={localStyles.headerContent}>
            <PaperIcon source='assignment-ind' size={DimensionHelper.wp(6)} color={theme.colors.onPrimary} />
            <PaperText variant="headlineSmall" style={localStyles.headerTitle}>{plan?.name}</PaperText>
          </View>
        </Surface>
      )}
      <View style={localStyles.segmentedButtonContainer}>
        <SegmentedButtons
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as 'serviceOrder' | 'teams')}
          buttons={[
            { value: 'serviceOrder', label: 'Service Order' },
            { value: 'teams', label: 'Teams' },
          ]}
        />
      </View>
      {isLoading ? <Loader isLoading={isLoading} /> :
        errorMessage ? <View style={localStyles.errorMessageView} >
          <PaperText style={localStyles.errorMessageText}>{errorMessage}</PaperText>
        </View> : (
          <ScrollView style={localStyles.contentScrollView} contentContainerStyle={{flexGrow:1}}>
              {getPositionDetailsDisplay()}
              {getNotesDisplay()}
              {selectedTab === 'serviceOrder' && plan && <ServiceOrder plan={plan} />}
              {selectedTab === 'teams' && (
                // Nested ScrollView might be problematic, ensure parent ScrollView allows this or structure differently if issues arise.
                // The content of getTeamsDisplay might need its own scroll handling if it's very long.
                <View style={localStyles.teamsScrollViewContainer}>
                  {getTeamsDisplay()}
                </View>
              )}
          </ScrollView>
        )}
    </SafeAreaView>
  );
};

export default PlanDetails;
