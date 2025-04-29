import { EventInterface } from "@churchapps/helpers";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { DimensionHelper } from '@churchapps/mobilehelper';
import { useIsFocused } from '@react-navigation/native';
import Markdown from '@ronradtke/react-native-markdown-display';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from 'react-native-calendars';
import Icon from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Loader, MainHeader } from "../components";
import CreateEvent from "../components/eventCalendar/CreateEvent";
import { EventModal } from "../components/eventCalendar/EventModal";
import { CustomModal } from "../components/modals/CustomModal";
import Conversations from "../components/Notes/Conversations";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "@/src/helpers";
import { GroupMemberInterface } from "@/src/interfaces";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";

dayjs.extend(utc);
dayjs.extend(timezone);

const TABS = ["Conversations", "Group Members", "Group Calendar"];

const GroupDetails = (props: any) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { group } = useLocalSearchParams<{ group: any }>();
  const groupDetails = JSON.parse(group);
  const { id: groupId, name, photoUrl, about } = groupDetails;
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [selected, setSelected] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null)

  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [editEvent, setEditEvent] = useState<EventInterface | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);


  const loadData = async () => {
    setLoading(true);
    ApiHelper.get(`/groupmembers?groupId=${groupId}`, "MembershipApi").then(
      (data) => { setGroupMembers(data), setLoading(false); }
    );
  };

  const loadEvents = async () => {
    setLoading(true);
    await ApiHelper.get(`/events/group/${groupId}`, "ContentApi").then(
      (data) => {
        const result = updateTime(data);
        setEvents(result);
        setLoading(false);
      });
  };

  const updateTime = (data: any) => {
    const result: EventInterface[] = [];
    data.forEach((d: EventInterface) => {
      const ev = { ...d };
      let tz = new Date().getTimezoneOffset();
      ev.start = ev.start ? new Date(ev.start) : new Date();
      ev.end = ev.end ? new Date(ev.end) : new Date();
      ev.start.setMinutes(ev.start.getMinutes() - tz);
      ev.end.setMinutes(ev.end.getMinutes() - tz);
      result.push(ev);
    });
    return result;
  }

  useEffect(() => {
    if (isFocused) {
      loadData();
      loadEvents();
    }
  }, [groupId, isFocused])

  const expandEvents = (allEvents: EventInterface[]) => {
    const expandedEvents: EventInterface[] = [];
    const startRange = dayjs().subtract(1, 'year');
    const endRange = dayjs().add(1, 'year');

    allEvents.forEach((event: any) => {
      const ev = { ...event };
      ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
      ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

      if (ev.start && ev.end) {
        if (event.recurrenceRule) {
          const dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
          dates.forEach((date) => {
            const evInstance = { ...event };
            const diff = ev.end.diff(ev.start);
            evInstance.start = dayjs(date);
            evInstance.end = evInstance.start.add(diff, 'ms');
            expandedEvents.push(evInstance);
          });
          EventHelper.removeExcludeDates(expandedEvents);
        } else {
          expandedEvents.push(ev);
        }
      }
    });
    return expandedEvents;
  };

  const expandedEvents = useMemo(() => expandEvents(events), [events]);

  const markedDates = useMemo(() => {
    const marked: any = {};

    expandedEvents.forEach((event) => {
      if (!event.start || !event.end) return;
      let currentDate = dayjs(event.start);
      const endDate = dayjs(event.end);

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const dateString = currentDate.format('YYYY-MM-DD');
        const dotColor = '#fff';

        marked[dateString] = {
          ...marked[dateString],
          dots: [...(marked[dateString]?.dots || []), { color: dotColor }],
          events: [...(marked[dateString]?.events || []), event],
          marked: true,
          textColor: 'black',
          selected: true
        };

        currentDate = currentDate.add(1, 'day');
      }
    });

    return marked;
  }, [expandedEvents]);

  const onDayPress = useCallback(
    (day: DateData) => {
      setSelected(day.dateString);
      const selectedDayEvents = markedDates[day.dateString]?.events || [];
      if (selectedDayEvents.length !== 0) {
        setShowEventModal(true);
        setSelectedEvents(selectedDayEvents);
      }
    },
    [markedDates]
  );

  const getDisplayTime = (data: EventInterface) => {
    if (!data || !data.start || !data.end) {
      return "Invalid event data";
    }

    const start = dayjs(data.start);
    const end = dayjs(data.end);

    if (data.allDay) {
      const formattedStart = start.format('MMMM D, YYYY');
      const formattedEnd = end.format('MMMM D, YYYY');

      return formattedStart === formattedEnd
        ? formattedStart
        : `${formattedStart} - ${formattedEnd}`;
    } else {
      const formattedStart = start.format('MMMM D, YYYY h:mm A');
      const formattedEndTime = end.format('h:mm A');
      const formattedEndDate = end.format('MMMM D, YYYY');

      return start.isSame(end, 'day')
        ? `${formattedStart} - ${formattedEndTime}`
        : `${formattedStart} - ${formattedEndDate} ${formattedEndTime}`;
    }
  };

  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp("90%") }]} onPress={() => {
        // navigate("MemberDetailScreen", { member: item.person });
        router.navigate({
          pathname: '/memberDetail',
          params: {
            member: JSON.stringify(item.person)
          }
        })
      }} >
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
    return (
      <FlatList data={groupMembers}
        renderItem={({ item }) => showGroupMembers(false, item)}
        keyExtractor={(item: any) => item?.id}
        ListEmptyComponent={() => <Text style={styles.noMemberText}>No group members found.</Text>}
      />
    );
  };

  if (!UserHelper.currentUserChurch?.person?.id) {
    return (<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
      <Text style={globalStyles.searchMainText}>Please Login to view your groups</Text>
    </View>
    );
  }

  let isLeader = false;
  UserHelper.currentUserChurch.groups?.forEach((g: any) => {
    if (g.id === groupId && g.leader) isLeader = true;
  });

  const handleAddEvent = (slotInfo: any) => {
    const startTime = new Date(slotInfo.start);
    startTime.setHours(12);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    const endTime = new Date(slotInfo.start);
    endTime.setHours(13);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    setEditEvent({ start: startTime, end: endTime, allDay: false, groupId: groupId, visibility: "public" })
  }

  const handleDone = () => {
    setShowAddEventModal(false)
    setEditEvent(null);
    loadEvents();
  }

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: "100%", backgroundColor: "white" }]} >
      <MainHeader title={name} openDrawer={navigation.openDrawer} back={navigation.goBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
        <View style={{ margin: 16 }}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={globalStyles.groupImage} />
          ) : (
            <View
              style={[
                globalStyles.groupImage,
                { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
              ]}
            >
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
          <Markdown>{about}</Markdown>
        </View>

        <View style={styles.tabContainer}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={`tab-${idx}`}
              style={[styles.tab, activeTab === idx && styles.activeTab]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[activeTab === idx && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* RENDER CONVERSATION */}

        {activeTab === 0 && (<Conversations contentType="group" contentId={groupId} groupId={groupId} from="GroupDetails" />)}
        {activeTab === 1 && (<View style={{ height: DimensionHelper.hp('55%'), paddingBottom: DimensionHelper.wp('2%') }}>{getGroupMembers()}</View>)}
        {activeTab === 2 && (<View>
          {isLeader &&
            <TouchableOpacity style={styles.addButtonContainer}
              onPress={() => { setShowAddEventModal(true), handleAddEvent({ start: new Date(), end: new Date() }) }}
            >
              <MaterialIcons name={'event-note'} size={DimensionHelper.wp('6%')} color={Constants.Colors.app_color} />
              <Text style={styles.addButtonText}>ADD EVENT</Text>
            </TouchableOpacity>
          }
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
        {showEventModal &&
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
                <View style={styles.eventContainer} key={index}>
                  <View style={{ paddingVertical: DimensionHelper.wp(1), flex: 1 }}>
                    <Text style={styles.eventText}>Event Name: {data.title}</Text>
                    <Text style={styles.eventTime}>Date and Time: {getDisplayTime(data)}</Text>
                  </View>
                  <Icon name={"edit"} style={globalStyles.closeIcon} size={DimensionHelper.wp("6%")}
                    onPress={() => { setShowEventModal(false); setEditEvent(data); setShowAddEventModal(true); }}
                  />
                </View>
              ))}
            </View>
          </CustomModal>}
        {showAddEventModal &&
          <EventModal width={DimensionHelper.wp('95%')} height={DimensionHelper.hp('80%')} isVisible={showAddEventModal} close={() => setShowAddEventModal(false)}>
            <View style={styles.modalConatiner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalText}>{!editEvent?.id ? "Add" : "Edit"} Event</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddEventModal(false);
                  }}
                  style={styles.modalIcon}
                >
                  <Icon name={"close"} style={globalStyles.closeIcon} size={DimensionHelper.wp("6%")} />
                </TouchableOpacity>
              </View>
              <View style={{}}>
                {editEvent && isLeader && <CreateEvent event={editEvent} onDone={handleDone} />}
              </View>
            </View>
          </EventModal>}
      </KeyboardAvoidingView>
      {loading && <Loader isLoading={loading} />}
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
  },
  noImageText: {
    color: '#888'
  },
  noMemberText: {
    textAlign: 'center', marginTop: 10
  },
  addButtonContainer: {
    borderWidth: 1, paddingVertical: DimensionHelper.wp('2%'), paddingHorizontal: DimensionHelper.wp('2.5%'), margin: DimensionHelper.wp('2%'), marginBottom: 0,
    borderRadius: DimensionHelper.wp('1%'), alignItems: 'center', alignSelf: 'flex-end', borderColor: Constants.Colors.app_color, flexDirection: 'row'
  },
  addButtonText: {
    fontSize: DimensionHelper.wp('4%'), marginLeft: DimensionHelper.wp('2%'), color: Constants.Colors.app_color
  },
  eventContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  }
});