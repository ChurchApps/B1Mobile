import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View, ScrollView } from "react-native";
import { Text, TouchableRipple, Button, Surface, Avatar } from "react-native-paper";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";
import Markdown from "@ronradtke/react-native-markdown-display";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "@churchapps/mobilehelper";
import { GroupMemberInterface } from "@/src/interfaces/Membership";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper } from "@/src/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import Conversations from "@/src/components/Notes/Conversations";
import { EventModal } from "@/src/components/eventCalendar/EventModal";
import CreateEvent from "@/src/components/eventCalendar/CreateEvent";
import { useAppTheme } from "@/src/theme";

dayjs.extend(utc);
dayjs.extend(timezone);

const TABS = ["Conversations", "Group Members", "Group Calendar"];

const GroupDetails = () => {
  const { theme, spacing } = useAppTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null);
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
    ApiHelper.get(`/groupmembers?groupId=${id}`, "MembershipApi").then(data => {
      setGroupMembers(data), setLoading(false);
    });
  };

  const loadEvents = async () => {
    setLoading(true);
    await ApiHelper.get(`/events/group/${id}`, "ContentApi").then(data => {
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
  };

  const handleAddEvent = (slotInfo: any) => {
    const startTime = new Date(slotInfo.start);
    startTime.setHours(12);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    const endTime = new Date(slotInfo.start);
    endTime.setHours(13);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    setEditEvent({ start: startTime, end: endTime, allDay: false, groupId: id, visibility: "public" });
  };

  const getGroupMembers = () => (
    <FlatList
      data={groupMembers}
      renderItem={({ item }) => showGroupMembers(false, item)}
      keyExtractor={(item: any) => item?.id}
      ListEmptyComponent={() => <Text style={styles.noMemberText}>No group members found.</Text>}
    />
  );

  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => (
    <TouchableRipple
      style={{ width: DimensionHelper.wp(90), marginHorizontal: 8, marginVertical: 4, borderRadius: 8 }}
      onPress={() => {
        router.navigate({
          pathname: "/memberDetail",
          params: {
            member: JSON.stringify(item.person)
          }
        });
      }}>
      <Surface style={{ flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8 }}>
        <Avatar.Image size={48} source={item?.person?.photo ? { uri: EnvironmentHelper.ContentRoot + item.person.photo } : Constants.Images.ic_member} />
        <Text variant="titleMedium" style={{ marginLeft: 16, flex: 1 }}>
          {item?.person?.name?.display}
        </Text>
      </Surface>
    </TouchableRipple>
  );

  const expandEvents = (allEvents: EventInterface[]) => {
    const expandedEvents: EventInterface[] = [];
    const startRange = dayjs().subtract(1, "year");
    const endRange = dayjs().add(1, "year");

    allEvents.forEach((event: any) => {
      const ev = { ...event };
      ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
      ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

      if (ev.start && ev.end) {
        if (event.recurrenceRule) {
          const dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
          dates.forEach(date => {
            const evInstance = { ...event };
            const diff = ev.end.diff(ev.start);
            evInstance.start = dayjs(date);
            evInstance.end = evInstance.start.add(diff, "ms");
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

    expandedEvents.forEach(event => {
      if (!event.start || !event.end) return;
      let currentDate = dayjs(event.start);
      const endDate = dayjs(event.end);

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD");
        const dotColor = "#fff";

        marked[dateString] = {
          ...marked[dateString],
          dots: [...(marked[dateString]?.dots || []), { color: dotColor }],
          events: [...(marked[dateString]?.events || []), event],
          marked: true,
          textColor: "black",
          selected: true
        };

        currentDate = currentDate.add(1, "day");
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
  }, [id, isFocused]);

  if (!groupDetails) {
    return (
      <LoadingWrapper loading={true}>
        <View />
      </LoadingWrapper>
    );
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
      <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <SafeAreaView style={{ flex: 1 }}>
          <MainHeader title={name} openDrawer={navigation.openDrawer} back={navigation.goBack} />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
            <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={{ width: "100%", height: 200, borderRadius: theme.roundness, marginBottom: spacing.md }} resizeMode="cover" />
              ) : (
                <Surface
                  style={{
                    height: 200,
                    width: "100%",
                    borderRadius: theme.roundness,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surfaceVariant,
                    marginBottom: spacing.md
                  }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    No image available
                  </Text>
                </Surface>
              )}
              <Markdown>{about}</Markdown>
            </Surface>

            <Surface style={{ margin: spacing.md, padding: spacing.md, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
              <View style={styles.tabContainer}>
                {TABS.map((tab, idx) => (
                  <TouchableRipple
                    key={tab.toLowerCase().replace(/\s+/g, "-")}
                    style={[
                      styles.tab,
                      activeTab === idx && {
                        borderBottomWidth: 2,
                        borderBottomColor: theme.colors.primary
                      }
                    ]}
                    onPress={() => setActiveTab(idx)}>
                    <Text
                      variant="labelLarge"
                      style={{
                        color: activeTab === idx ? theme.colors.primary : theme.colors.onSurface,
                        textAlign: "center"
                      }}
                      numberOfLines={1}>
                      {tab}
                    </Text>
                  </TouchableRipple>
                ))}
              </View>

              {activeTab === 0 && (
                <ScrollView>
                  <Conversations contentType="group" contentId={id} groupId={id} from="GroupDetails" />
                </ScrollView>
              )}
              {activeTab === 1 && (
                <View style={{ backgroundColor: theme.colors.background, borderRadius: theme.roundness, paddingVertical: spacing.sm }}>
                  <FlatList
                    data={groupMembers}
                    renderItem={({ item }) => (
                      <Surface style={styles.memberCard}>
                        <Avatar.Image size={48} source={item?.person?.photo ? { uri: EnvironmentHelper.ContentRoot + item.person.photo } : Constants.Images.ic_member} />
                        <Text variant="titleMedium" style={{ marginLeft: 16, flex: 1 }}>
                          {item?.person?.name?.display}
                        </Text>
                      </Surface>
                    )}
                    keyExtractor={(item: any) => item?.id}
                    ListEmptyComponent={() => (
                      <Text variant="bodyMedium" style={styles.noMemberText}>
                        No group members found.
                      </Text>
                    )}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}
                  />
                </View>
              )}
              {activeTab === 2 && (
                <ScrollView>
                  <Surface style={{ padding: spacing.md }}>
                    {isLeader && (
                      <Button
                        mode="outlined"
                        icon="calendar-plus"
                        onPress={() => {
                          setShowAddEventModal(true);
                          handleAddEvent({ start: new Date(), end: new Date() });
                        }}
                        style={{ marginBottom: spacing.md, alignSelf: "flex-end" }}>
                        ADD EVENT
                      </Button>
                    )}
                    <Calendar
                      current={selected}
                      markingType="multi-dot"
                      markedDates={markedDates}
                      onDayPress={onDayPress}
                      theme={{
                        textInactiveColor: theme.colors.onSurfaceDisabled,
                        textSectionTitleDisabledColor: theme.colors.onSurfaceDisabled,
                        textSectionTitleColor: theme.colors.primary,
                        arrowColor: theme.colors.primary,
                        todayTextColor: theme.colors.error,
                        selectedDayBackgroundColor: theme.colors.primary,
                        selectedDayTextColor: theme.colors.onPrimary
                      }}
                    />
                  </Surface>
                </ScrollView>
              )}
            </Surface>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
      {showEventModal && (
        <EventModal isVisible={showEventModal} close={() => setShowEventModal(false)}>
          {selectedEvents &&
            selectedEvents.map((event: EventInterface) => (
              <View key={event.id}>
                <Text variant="titleMedium">{event.title}</Text>
                <Text variant="bodyMedium">{event.description}</Text>
              </View>
            ))}
        </EventModal>
      )}
      {showAddEventModal && editEvent && (
        <CreateEvent
          event={editEvent}
          onDone={() => {
            setShowAddEventModal(false);
            loadEvents();
          }}
        />
      )}
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    width: "100%"
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center"
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  noMemberText: {
    textAlign: "center",
    marginTop: 10
  }
});

export default GroupDetails;
