import { EventInterface } from "@churchapps/helpers";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { DateHelper, DimensionHelper } from '@churchapps/mobilehelper';
import Markdown from '@ronradtke/react-native-markdown-display';
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from 'react-native-calendars';
import Icon from "react-native-vector-icons/FontAwesome";
import { MainHeader } from "../components";
import { CustomModal } from "../components/modals/CustomModal";
import Conversations from "../components/Notes/Conversations";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../helpers";
import { GroupMemberInterface } from "../interfaces";

const TABS = ["Conversations", "Group Members", "Group Calendar"];

const GroupDetails = (props: any) => {
  const { navigate } = props.navigation;
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [selected, setSelected] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null)
  const { id: groupId, name, photoUrl, about } = props?.route?.params?.group;


  const loadData = async () => {
    ApiHelper.get(`/groupmembers?groupId=${groupId}`, "MembershipApi").then(
      (data) => setGroupMembers(data)
    );
  };

  const loadEvents = async () => {
    ApiHelper.get(`/events/group/${groupId}`, "ContentApi").then(
      (data) => setEvents(data)
    );
  };

  useEffect(() => { loadData(); loadEvents(); }, []);

  const expandEvents = (events: any) => {
    const expandedEvents: EventInterface[] = [];
    const startRange = new Date();
    const endRange = new Date();
    startRange.setFullYear(startRange.getFullYear() - 1);
    endRange.setFullYear(endRange.getFullYear() + 1);

    events.forEach((event) => {
      const ev = { ...event };
      ev.start = ev.start ? new Date(ev.start) : undefined;
      ev.end = ev.end ? new Date(ev.end) : undefined;
      if (event.recurrenceRule) {
        const dates = EventHelper.getRange(event, startRange, endRange);
        dates.forEach((date) => {
          const ev = { ...event };
          if (ev.start && ev.end) {
            const diff = new Date(ev.end).getTime() - new Date(ev.start).getTime();
            ev.start = date;
            ev.end = new Date(date.getTime() + diff);
            expandedEvents.push(ev);
          }
        });
        EventHelper.removeExcludeDates(expandedEvents);
      }
      else expandedEvents.push(ev);
    });
    return expandedEvents;
  };

  const expandedEvents = useMemo(() => expandEvents(events), [events]);

  const markedDates = useMemo(() => {
    const marked = {};

    expandedEvents.forEach(event => {
      const startString = moment(event.start).format('YYYY-MM-DD');
      const endString = moment(event.end).format('YYYY-MM-DD');
      const dotColor = '#fff';

      if (!marked[startString]) {
        marked[startString] = { dots: [], marked: true, startingDay: true, color: '#70d7c7', textColor: 'white', selected: true, };
      }
      marked[startString].dots.push({ color: dotColor });

      if (startString !== endString) {
        if (!marked[endString]) {
          marked[endString] = { dots: [], marked: true, endingDay: true, color: '#70d7c7', textColor: 'white', selected: true, };
        }
        marked[endString].dots.push({ color: dotColor });

        const diffInDays = moment(event.end).diff(moment(event.start), 'days');
        for (let i = 1; i < diffInDays; i++) {
          const middleDate = moment(event.start).add(i, 'days').format('YYYY-MM-DD');
          if (!marked[middleDate]) {
            marked[middleDate] = { dots: [], marked: true, color: '#70d7c7', textColor: 'white', selected: true, };
          }
          marked[middleDate].dots.push({ color: dotColor });
        }
      }
    });

    return marked;
  }, [expandedEvents, selected]);

  const onDayPress = useCallback(
    (day: DateData) => {
      setSelected(day.dateString);
      const selectedDayEvents = expandedEvents.filter((event: any) =>
        moment(day.dateString).isBetween(
          moment(event.start).format('YYYY-MM-DD'),
          moment(event.end).format('YYYY-MM-DD'),
          null,
          '[]'
        )
      );
      if (selectedDayEvents.length !== 0) {
        setShowEventModal(true);
        setSelectedEvents(selectedDayEvents);
      }
    },
    [expandedEvents]
  );

  const getDisplayTime = (data: any) => {
    const ev = { ...data };
    let tz = new Date().getTimezoneOffset();
    ev.start = new Date(ev.start);
    ev.end = new Date(ev.end);
    ev.start.setMinutes(ev.start.getMinutes() - tz);
    ev.end.setMinutes(ev.end.getMinutes() - tz);

    let result = "";
    if (ev.allDay) {
      const prettyStartDate = DateHelper.prettyDate(ev.start);
      const prettyEndDate = DateHelper.prettyDate(ev.end);
      if (prettyStartDate === prettyEndDate) {
        result = prettyStartDate;
      } else {
        result = `${prettyStartDate} - ${prettyEndDate}`;
      }
    } else {
      const prettyStart = DateHelper.prettyDateTime(ev.start);
      const prettyEnd = DateHelper.prettyDateTime(ev.end);
      const prettyEndTime = DateHelper.prettyTime(ev.end);

      const startDate = DateHelper.prettyDate(new Date(ev.start));
      const endDate = DateHelper.prettyDate(new Date(ev.end));
      if (startDate === endDate) {
        result = `${prettyStart} - ${prettyEndTime}`;
      } else {
        result = `${prettyStart} - ${endDate} ${prettyEndTime}`;
      }
    }
    return result;
  }

  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp("90%") }]} onPress={() => { navigate("MemberDetailScreen", { member: item.person }); }} >
        <Image style={globalStyles.memberListIcon} source={
          item?.person?.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.person.photo }
            : Constants.Images.ic_member
        } />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>
            {item?.person?.name?.display}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getGroupMembers = () => {
    return (<FlatList data={groupMembers} renderItem={({ item }) => showGroupMembers(false, item)} keyExtractor={(item: any) => item?.id} />);
  };

  if (!UserHelper.currentUserChurch?.person?.id) {
    return (<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
      <Text style={globalStyles.searchMainText}>Please Login to view your groups</Text>
    </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: "100%", backgroundColor: "white" }]} >
      <MainHeader title={name} openDrawer={props.navigation.openDrawer} back={props.navigation.goBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
        <View style={{ margin: 16 }}>
          <Image source={{ uri: photoUrl }} style={globalStyles.groupImage} />
          <Markdown>{about}</Markdown>
        </View>

        <View style={styles.tabContainer}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity style={[styles.tab, activeTab === idx && styles.activeTab]} onPress={() => setActiveTab(idx)} >
              <Text style={[activeTab === idx && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* RENDER CONVERSATION */}

        {/* {activeTab === 0
          ? (<Conversations contentType="group" contentId={groupId} groupId={groupId} from="GroupDetails" />)
          : (<View>{getGroupMembers()}</View>)
        } */}

        {activeTab === 0 && (<Conversations contentType="group" contentId={groupId} groupId={groupId} from="GroupDetails" />)}
        {activeTab === 1 && (<View>{getGroupMembers()}</View>)}
        {activeTab === 2 && (<View>
          <Calendar
            current={selected}
            markingType='multi-dot'
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              textInactiveColor: '#a68a9f',
              textSectionTitleDisabledColor: 'grey',
              textSectionTitleColor: '#1C75BC',
              arrowColor: '#1C75BC',
              todayTextColor: 'red',
              selectedDayBackgroundColor: '#5E60CE',
              selectedDayTextColor: 'white',
            }}
          />
        </View>)}
        <CustomModal width={DimensionHelper.wp('85%')} isVisible={showEventModal} close={() => setShowEventModal(false)}>
          <View style={styles.modalConatiner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalText}>Event Details</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEventModal(false);
                }}
                style={styles.modalIcon}
              >
                <Icon name={"close"} style={globalStyles.closeIcon} size={DimensionHelper.wp("6%")} />
              </TouchableOpacity>
            </View>
            {selectedEvents?.map((data: any, index: number) => (
              <View style={{ paddingVertical: DimensionHelper.wp(1) }} key={index}>
                <Text style={styles.eventText}>Event Name: {data.title}</Text>
                <Text style={styles.eventTime}>Date and Time: {getDisplayTime(data)}</Text>
              </View>
            ))}
          </View>
        </CustomModal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  tabContainer: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginLeft: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  activeTab: { borderBottomWidth: 1, borderBottomColor: Constants.Colors.app_color },
  activeTabText: { color: Constants.Colors.app_color, fontWeight: "600" },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10
  },
  month: {
    marginLeft: 5
  },
  year: {
    marginRight: 5
  },
  modalConatiner: {
    paddingHorizontal: DimensionHelper.wp(1)
  },
  modalHeader: {
    width: '100%', height: DimensionHelper.wp('9%'), marginBottom: DimensionHelper.wp('3%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'lightgray', borderBottomWidth: 1
  },
  modalText: {
    fontSize: DimensionHelper.wp('5.5%'), color: '#000'
  },
  modalIcon: {
    height: DimensionHelper.wp('8%'), width: DimensionHelper.wp('5%'), justifyContent: 'center'
  },
  eventText: {
    fontSize: DimensionHelper.wp('4%'), fontWeight: '800', color: '#000'
  },
  eventTime: {
    fontSize: DimensionHelper.wp('4%'), color: '#000'
  }
});