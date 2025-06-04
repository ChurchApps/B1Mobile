import React from 'react';
import { Provider as PaperProvider, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import CreateEvent from "@/src/components/eventCalendar/CreateEvent";
import { EventModal } from "@/src/components/eventCalendar/EventModal";
import { Loader } from "@/src/components/Loader";
import { CustomModal } from "@/src/components/modals/CustomModal";
import Conversations from "@/src/components/Notes/Conversations";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "@/src/helpers";
import { GroupMemberInterface } from "@/src/interfaces/Membership";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "@churchapps/mobilehelper";
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Markdown from "@ronradtke/react-native-markdown-display";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Text, TouchableRipple, IconButton, Button, Surface, Divider, Avatar, useTheme } from 'react-native-paper';
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";

dayjs.extend(utc);
dayjs.extend(timezone);

const TABS = ["Conversations", "Group Members", "Group Calendar"];

const GroupDetails = () => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [groupDetails, setGroupDetails] = useState<any>(null);
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

  const loadGroupDetails = async () => {
    setLoading(true);
    try {
      const data = await ApiHelper.get(`/groups/${id}`, "MembershipApi");
      setGroupDetails(data);
    } catch (error) {
      console.error("Error loading group details:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    ApiHelper.get(`/groupmembers?groupId=${id}`, "MembershipApi").then(
      (data) => { setGroupMembers(data), setLoading(false); }
    );
  };

  const loadEvents = async () => {
    setLoading(true);
    await ApiHelper.get(`/events/group/${id}`, "ContentApi").then(
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

  const handleAddEvent = (slotInfo: any) => {
    const startTime = new Date(slotInfo.start);
    startTime.setHours(12);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    const endTime = new Date(slotInfo.start);
    endTime.setHours(13);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    setEditEvent({ start: startTime, end: endTime, allDay: false, groupId: id, visibility: "public" })
  }

  const getGroupMembers = () => {
    return (
      <FlatList data={groupMembers}
        renderItem={({ item }) => showGroupMembers(false, item)}
        keyExtractor={(item: any) => item?.id}
        ListEmptyComponent={() => <Text style={styles.noMemberText}>No group members found.</Text>}
      />
    );
  };

  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => {
    return (
      <TouchableRipple
        style={{ width: DimensionHelper.wp(90), marginHorizontal: 8, marginVertical: 4, borderRadius: 8 }}
        onPress={() => {
          router.navigate({
            pathname: '/memberDetail',
            params: {
              member: JSON.stringify(item.person)
            }
          })
        }}
      >
        <Surface style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 }}>
          <Avatar.Image
            size={48}
            source={
              item?.person?.photo
                ? { uri: EnvironmentHelper.ContentRoot + item.person.photo }
                : Constants.Images.ic_member
            }
          />
          <Text variant="titleMedium" style={{ marginLeft: 16, flex: 1 }}>
            {item?.person?.name?.display}
          </Text>
        </Surface>
      </TouchableRipple>
    );
  };

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

  useEffect(() => {
    if (isFocused) {
      loadGroupDetails();
      loadData();
      loadEvents();
    }
  }, [id, isFocused])

  if (!groupDetails) {
    return <LoadingWrapper loading={true}><View /></LoadingWrapper>;
  }

  const { name, photoUrl, about } = groupDetails;

  if (!UserHelper.currentUserChurch?.person?.id) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="titleMedium">Please Login to view your groups</Text>
      </Surface>
    );
  }

  let isLeader = false;
  UserHelper.currentUserChurch.groups?.forEach((g: any) => {
    if (g.id === id && g.leader) isLeader = true;
  });

  return (
    <LoadingWrapper loading={loading}>
      <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: "100%", backgroundColor: theme.colors.background }]}>
        <MainHeader title={name} openDrawer={navigation.openDrawer} back={navigation.goBack} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
          <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  marginBottom: 16
                }}
                resizeMode="cover"
              />
            ) : (
              <Surface
                style={{
                  height: 200,
                  width: '100%',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  marginBottom: 16
                }}
              >
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No image available</Text>
              </Surface>
            )}
            <Markdown>{about}</Markdown>
          </Surface>

          <Surface style={styles.tabContainer}>
            {TABS.map((tab, idx) => (
              <TouchableRipple
                key={tab.toLowerCase().replace(/\s+/g, '-')}
                style={[styles.tab, activeTab === idx && { borderBottomWidth: 1, borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab(idx)}
              >
                <Text variant="labelLarge" style={{ color: activeTab === idx ? theme.colors.primary : theme.colors.onSurface }}>
                  {tab}
                </Text>
              </TouchableRipple>
            ))}
          </Surface>

          {activeTab === 0 && (<Conversations contentType="group" contentId={id} groupId={id} from="GroupDetails" />)}
          {activeTab === 1 && (
            <Surface style={{ height: DimensionHelper.hp(55), paddingBottom: DimensionHelper.wp(2) }}>
              <FlatList
                data={groupMembers}
                renderItem={({ item }) => showGroupMembers(false, item)}
                keyExtractor={(item: any) => item?.id}
                ListEmptyComponent={() => <Text variant="bodyMedium" style={styles.noMemberText}>No group members found.</Text>}
              />
            </Surface>
          )}
          {activeTab === 2 && (
            <Surface>
              {isLeader && (
                <Button
                  mode="outlined"
                  icon="calendar-plus"
                  onPress={() => { setShowAddEventModal(true), handleAddEvent({ start: new Date(), end: new Date() }) }}
                  style={{ margin: 16, alignSelf: 'flex-end' }}
                >
                  ADD EVENT
                </Button>
              )}
              <Calendar
                current={selected}
                markingType='multi-dot'
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={{
                  textInactiveColor: theme.colors.onSurfaceDisabled,
                  textSectionTitleDisabledColor: theme.colors.onSurfaceDisabled,
                  textSectionTitleColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                  todayTextColor: theme.colors.error,
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: theme.colors.onPrimary,
                }}
              />
            </Surface>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  noMemberText: {
    textAlign: 'center',
    marginTop: 10
  }
});

export default GroupDetails; 