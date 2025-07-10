import React from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { Text, TouchableRipple, Button, Surface, Avatar } from "react-native-paper";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useLocalSearchParams } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";
import Markdown from "@ronradtke/react-native-markdown-display";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useQuery } from "@tanstack/react-query";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "../../../../src/mobilehelper";
import { Constants, EnvironmentHelper } from "../../../../src/helpers";
import { MainHeader } from "../../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../../src/components/wrapper/LoadingWrapper";
import Conversations from "../../../../src/components/Notes/Conversations";
import { EventModal } from "../../../../src/components/eventCalendar/EventModal";
import CreateEvent from "../../../../src/components/eventCalendar/CreateEvent";
import { useAppTheme } from "../../../../src/theme";
import { OptimizedImage } from "../../../../src/components/OptimizedImage";
import { useCurrentUserChurch } from "../../../../src/stores/useUserStore";

dayjs.extend(utc);
dayjs.extend(timezone);

const TABS = ["Conversations", "Group Members", "Group Calendar"];

const GroupDetails = () => {
  const { theme, spacing } = useAppTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null);
  const [editEvent, setEditEvent] = useState<EventInterface | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);

  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for group details
  const {
    data: groupDetails,
    isLoading: groupDetailsLoading,
    error: groupDetailsError,
    isError: groupDetailsIsError
  } = useQuery({
    queryKey: [`/groups/${id}`, "MembershipApi"],
    enabled: !!id && !!currentUserChurch?.jwt,
    placeholderData: null,
    staleTime: 10 * 60 * 1000, // 10 minutes - group details don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: 1000,
    meta: {
      errorMessage: "Failed to load group details"
    }
  });

  // Use react-query for group members
  const {
    data: groupMembers = [],
    isLoading: groupMembersLoading,
    error: groupMembersError,
    isError: groupMembersIsError
  } = useQuery({
    queryKey: [`/groupmembers?groupId=${id}`, "MembershipApi"],
    enabled: !!id && !!currentUserChurch?.jwt && !!groupDetails, // Only load after group details
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes - membership changes occasionally
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: 1000
  });

  // Use react-query for group events
  const {
    data: eventsData = [],
    isLoading: eventsLoading,
    error: eventsError,
    isError: eventsIsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: [`/events/group/${id}`, "ContentApi"],
    enabled: !!id && !!currentUserChurch?.jwt && !!groupDetails, // Only load after group details
    placeholderData: [],
    staleTime: 3 * 60 * 1000, // 3 minutes - events change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000
  });

  const loading = groupDetailsLoading || groupMembersLoading || eventsLoading;
  const hasError = groupDetailsIsError || groupMembersIsError || eventsIsError;
  const errors = [groupDetailsError, groupMembersError, eventsError].filter(Boolean);

  const updateTime = useCallback((data: any) => {
    if (!data || !Array.isArray(data)) return [];

    try {
      const tz = new Date().getTimezoneOffset();
      return data.map((d: EventInterface) => {
        try {
          const ev = { ...d };
          ev.start = ev.start ? new Date(ev.start) : new Date();
          ev.end = ev.end ? new Date(ev.end) : new Date();
          ev.start.setMinutes(ev.start.getMinutes() - tz);
          ev.end.setMinutes(ev.end.getMinutes() - tz);
          return ev;
        } catch (error) {
          console.warn("Error updating time for event:", d.id, error);
          return d;
        }
      });
    } catch (error) {
      console.error("Error updating event times:", error);
      return [];
    }
  }, []);

  const events = useMemo(() => updateTime(eventsData), [eventsData, updateTime]);

  const handleAddEvent = useCallback(
    (slotInfo: any) => {
      try {
        const startTime = new Date(slotInfo.start);
        startTime.setHours(12);
        startTime.setMinutes(0);
        startTime.setSeconds(0);
        const endTime = new Date(slotInfo.start);
        endTime.setHours(13);
        endTime.setMinutes(0);
        endTime.setSeconds(0);
        setEditEvent({ start: startTime, end: endTime, allDay: false, groupId: id, visibility: "public" });
      } catch (error) {
        console.error("Error creating new event:", error);
      }
    },
    [id]
  );

  const expandEvents = useCallback((allEvents: EventInterface[]) => {
    if (!allEvents || allEvents.length === 0) return [];

    try {
      const expandedEvents: EventInterface[] = [];
      const startRange = dayjs().subtract(1, "year");
      const endRange = dayjs().add(1, "year");

      allEvents.forEach((event: any) => {
        try {
          const ev = { ...event };
          ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
          ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

          if (ev.start && ev.end) {
            if (event.recurrenceRule) {
              try {
                const dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
                if (dates && dates.length > 0) {
                  dates.forEach(date => {
                    const evInstance = { ...event };
                    const diff = ev.end.diff(ev.start);
                    evInstance.start = dayjs(date);
                    evInstance.end = evInstance.start.add(diff, "ms");
                    expandedEvents.push(evInstance);
                  });
                  EventHelper.removeExcludeDates(expandedEvents);
                }
              } catch (recurrenceError) {
                console.warn("Error processing recurrence rule for event:", event.id, recurrenceError);
                // Fallback to single event
                expandedEvents.push(ev);
              }
            } else {
              expandedEvents.push(ev);
            }
          }
        } catch (eventError) {
          console.warn("Error processing event:", event.id, eventError);
        }
      });
      return expandedEvents;
    } catch (error) {
      console.error("Error expanding events:", error);
      return [];
    }
  }, []);

  const expandedEvents = useMemo(() => {
    // Limit processing for performance - only expand events if reasonable amount
    if (events.length > 100) {
      console.warn("Large number of events detected, limiting expansion for performance");
      return events.slice(0, 50); // Limit to first 50 events
    }
    return expandEvents(events);
  }, [events, expandEvents]);

  const markedDates = useMemo(() => {
    const marked: any = {};

    if (!expandedEvents || expandedEvents.length === 0) return marked;

    try {
      expandedEvents.forEach(event => {
        if (!event.start || !event.end) return;

        try {
          let currentDate = dayjs(event.start);
          const endDate = dayjs(event.end);
          let iterations = 0;
          const maxIterations = 365; // Prevent infinite loops

          while ((currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) && iterations < maxIterations) {
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
            iterations++;
          }

          if (iterations >= maxIterations) {
            console.warn("Event marking exceeded max iterations for event:", event.id);
          }
        } catch (dateError) {
          console.warn("Error marking dates for event:", event.id, dateError);
        }
      });
    } catch (error) {
      console.error("Error creating marked dates:", error);
    }

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

  // Handle loading and error states
  if (groupDetailsLoading) {
    return (
      <LoadingWrapper loading={true}>
        <View />
      </LoadingWrapper>
    );
  }

  if (hasError) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg }}>
        <Text variant="titleMedium" style={{ marginBottom: spacing.md, textAlign: "center" }}>
          Error Loading Group Details
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          {errors[0]?.message || "Unable to load group information. Please try again."}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            // Refetch all queries
            if (groupDetailsError) refetchEvents();
            navigation.goBack();
          }}>
          Go Back
        </Button>
      </Surface>
    );
  }

  if (!groupDetails) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg }}>
        <Text variant="titleMedium" style={{ marginBottom: spacing.md, textAlign: "center" }}>
          Group Not Found
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          The requested group could not be found or you don't have permission to view it.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </Surface>
    );
  }

  const { name, photoUrl, about } = groupDetails;

  if (!currentUserChurch?.person?.id) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg }}>
        <Text variant="titleMedium" style={{ marginBottom: spacing.md, textAlign: "center" }}>
          Authentication Required
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: spacing.lg, textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          Please login to view group details.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </Surface>
    );
  }

  let isLeader = false;
  currentUserChurch?.groups?.forEach((g: any) => {
    if (g.id === id && g.leader) isLeader = true;
  });

  return (
    <LoadingWrapper loading={loading}>
      <View style={{ flex: 1, backgroundColor: theme.colors.surfaceVariant }}>
        <SafeAreaView style={{ flex: 1 }}>
          <MainHeader title={name} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
            <Surface style={{ margin: spacing.md, padding: spacing.lg, borderRadius: theme.roundness, backgroundColor: theme.colors.surface }}>
              {photoUrl ? (
                <OptimizedImage source={{ uri: photoUrl }} style={{ width: "100%", height: 200, borderRadius: theme.roundness, marginBottom: spacing.md }} contentFit="cover" priority="high" />
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
                <View style={{ flex: 1, minHeight: 300 }}>
                  <Conversations contentType="group" contentId={id} groupId={id} from="GroupDetails" />
                </View>
              )}
              {activeTab === 1 && (
                <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: theme.roundness, paddingVertical: spacing.sm }}>
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
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}
              {activeTab === 2 && (
                <View style={{ flex: 1 }}>
                  <Surface style={{ padding: spacing.md, flex: 1 }}>
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
                </View>
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
            refetchEvents();
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
