import React from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import { Text, Button, Surface, Card } from "react-native-paper";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useNavigation } from "../../../../src/hooks";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useQuery } from "@tanstack/react-query";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "../../../../src/mobilehelper";
import { MainHeader } from "../../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../../src/components/wrapper/LoadingWrapper";
import GroupChatModal from "../../../../src/components/modals/GroupChatModal";
import { useAppTheme } from "../../../../src/theme";
import { useCurrentUserChurch } from "../../../../src/stores/useUserStore";
import { 
  GroupHeroSection,
  GroupNavigationTabs,
  GroupAboutTab,
  GroupMembersTab,
  GroupCalendarTab,
  GroupEventModal
} from "../../../../src/components/group/exports";

dayjs.extend(utc);
dayjs.extend(timezone);

const GroupDetails = () => {
  const { theme, spacing } = useAppTheme();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack } = useNavigation();
  const { id, activeTab: initialActiveTab } = useLocalSearchParams<{ id: string; activeTab?: string }>();
  const [activeTab, setActiveTab] = useState(initialActiveTab ? parseInt(initialActiveTab) : 0);
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD")); // Always default to today
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const currentUserChurch = useCurrentUserChurch();

  // Refresh events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetchEvents();
      // If we came back with an activeTab parameter, set it
      if (initialActiveTab) {
        setActiveTab(parseInt(initialActiveTab));
      }
    }, [refetchEvents, initialActiveTab])
  );


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

  // Use react-query for group members - load immediately in parallel
  const {
    data: groupMembers = [],
    isLoading: groupMembersLoading,
    error: groupMembersError,
    isError: groupMembersIsError
  } = useQuery({
    queryKey: [`/groupmembers?groupId=${id}`, "MembershipApi"],
    enabled: !!id && !!currentUserChurch?.jwt, // Load in parallel with group details
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes - membership changes occasionally
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: 1000
  });

  // Use react-query for group events - load only when needed (lazy loading)
  const {
    data: eventsData = [],
    isLoading: eventsLoading,
    error: eventsError,
    isError: eventsIsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: [`/events/group/${id}`, "ContentApi"],
    enabled: !!id && !!currentUserChurch?.jwt && activeTab === 3, // Only load when calendar tab is active
    placeholderData: [],
    staleTime: 3 * 60 * 1000, // 3 minutes - events change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000
  });

  // Debug logging
  React.useEffect(() => {
    console.log("Events query state:", {
      activeTab,
      enabled: !!id && !!currentUserChurch?.jwt && activeTab === 3,
      eventsLoading,
      eventsData: eventsData?.length,
      eventsError,
      id,
      hasJWT: !!currentUserChurch?.jwt
    });
  }, [activeTab, id, currentUserChurch?.jwt, eventsLoading, eventsData, eventsError]);

  // Only block on essential data for initial render
  const loading = groupDetailsLoading;
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


  const expandEvents = useCallback((allEvents: EventInterface[]) => {
    if (!allEvents || allEvents.length === 0) return [];

    try {
      const expandedEvents: EventInterface[] = [];
      const startRange = dayjs().subtract(3, "months"); // April 2025 (3 months before July)
      const endRange = dayjs().add(3, "months");     // October 2025 (3 months after July)
      
      console.log("Expanding events from", startRange.format("YYYY-MM-DD"), "to", endRange.format("YYYY-MM-DD"));

      // Process limited events for performance
      const eventsToProcess = allEvents.slice(0, 30);
      console.log(`Processing ${eventsToProcess.length} of ${allEvents.length} events for performance`);

      eventsToProcess.forEach((event: any) => {
        try {
          const ev = { ...event };
          ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
          ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

          if (ev.start && ev.end) {
            if (event.recurrenceRule) {
              try {
                const dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
                // Reduced logging for performance
                if (dates && dates.length > 10) {
                  console.log(`Recurring event "${event.title}" generated ${dates.length} instances`);
                }
                if (dates && dates.length > 0) {
                  // Limit recurring instances to prevent performance issues
                  const limitedDates = dates.length > 25 ? dates.slice(0, 25) : dates;
                  if (dates.length > 25) {
                    console.log(`Limited "${event.title}" from ${dates.length} to ${limitedDates.length} instances`);
                  }
                  limitedDates.forEach(date => {
                    // Stop if we have too many total events
                    if (expandedEvents.length >= 150) return;
                    
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
              // For non-recurring events, check if they're in our date range
              const eventDate = dayjs(ev.start);
              if (eventDate.isAfter(startRange) && eventDate.isBefore(endRange)) {
                expandedEvents.push(ev);
                console.log(`Added non-recurring event: ${event.title} on ${eventDate.format("YYYY-MM-DD")}`);
              } else {
                console.log(`Filtered out event: ${event.title} on ${eventDate.format("YYYY-MM-DD")} (outside range)`);
              }
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

  // Event expansion with debugging
  const expandedEvents = useMemo(() => {
    // Only process events when calendar tab is active
    if (activeTab !== 3) return [];

    console.log("Raw events loaded:", events.length);
    console.log("Sample raw event:", events[0]);
    
    // For debugging, let's also try simple approach alongside expansion
    const simpleEvents = events.slice(0, 10).map(event => ({
      ...event,
      start: event.start ? dayjs(event.start) : null,
      end: event.end ? dayjs(event.end) : null
    }));
    
    console.log("Simple events:", simpleEvents.length);
    console.log("Sample simple event:", simpleEvents[0]);
    
    // Use the expandEvents function to properly handle recurring events
    const expanded = expandEvents(events);
    
    console.log("Expanded events:", expanded.length);
    console.log("Sample expanded event:", expanded[0]);
    
    // Return expanded events if we have them, otherwise fallback to simple
    return expanded.length > 0 ? expanded : simpleEvents;
  }, [events, activeTab, expandEvents]);

  // Optimize marked dates calculation with better performance
  const markedDates = useMemo(() => {
    // Only calculate when calendar tab is active and events are loaded
    if (activeTab !== 3 || !expandedEvents || expandedEvents.length === 0) {
      console.log("MarkedDates: Not calculating - activeTab:", activeTab, "events:", expandedEvents?.length);
      return {};
    }

    console.log("MarkedDates: Calculating for", expandedEvents.length, "events");
    const marked: any = {};

    try {
      // Mark only first 30 events for performance
      expandedEvents.slice(0, 30).forEach(event => {
        if (!event.start) return;

        const dateString = dayjs(event.start).format("YYYY-MM-DD");

        if (!marked[dateString]) {
          marked[dateString] = {
            dots: [],
            events: []
          };
        }

        marked[dateString].dots.push({ color: "#0D47A1" });
        marked[dateString].events.push(event);
        marked[dateString].marked = true;
      });
    } catch (error) {
      console.error("Error calculating marked dates:", error);
    }

    console.log("MarkedDates: Final marked dates:", Object.keys(marked).length);
    return marked;
  }, [expandedEvents, activeTab]);

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

  // Show skeleton UI immediately with progressive loading
  if (groupDetailsLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <MainHeader title="Loading..." openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigateBack} />

          <FlatList
            data={[{ key: "skeleton" }]}
            renderItem={() => (
              <View>
                {/* Skeleton Hero Section */}
                <View style={styles.heroSection}>
                  <Card style={styles.heroCard}>
                    <View style={[styles.heroImageContainer, styles.skeletonHero]}>
                      <View style={styles.heroOverlay}>
                        <View style={[styles.skeletonText, { width: "60%", height: 28, marginBottom: 12 }]} />
                        <View style={styles.heroStats}>
                          <View style={[styles.skeletonText, { width: 80, height: 20 }]} />
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>

                {/* Skeleton Navigation */}
                <Card style={styles.navigationCard}>
                  <Card.Content>
                    <View style={styles.navigationGrid}>
                      {[1, 2, 3, 4].map(i => (
                        <View key={i} style={styles.navButton}>
                          <View style={[styles.skeletonCircle, { width: 40, height: 40, marginBottom: 4 }]} />
                          <View style={[styles.skeletonText, { width: 50, height: 12 }]} />
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              </View>
            )}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainContainer}
          />
        </SafeAreaView>
      </View>
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
            navigateBack();
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
        <Button mode="contained" onPress={() => navigateBack()}>
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
        <Button mode="contained" onPress={() => navigateBack()}>
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
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <MainHeader title={name} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigateBack} />

          <FlatList
            data={[{ key: "content" }]}
            renderItem={() => (
              <View>
                {/* Hero Section */}
                <GroupHeroSection
                  name={name}
                  photoUrl={photoUrl}
                  memberCount={groupMembers.length}
                  isLeader={isLeader}
                />

                {/* Navigation Buttons */}
                <GroupNavigationTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onMessagesPress={() => setShowChatModal(true)}
                />

                {/* Content Display */}
                <Card style={styles.contentCard}>
                  {/* Tab Content */}
                  <View style={styles.tabContent}>
                    {activeTab === 0 && (
                      <GroupAboutTab about={about} />
                    )}

                    {activeTab === 2 && (
                      <GroupMembersTab 
                        members={groupMembers} 
                        isLoading={groupMembersLoading} 
                      />
                    )}

                    {activeTab === 3 && (
                      <GroupCalendarTab
                        groupId={id || ""}
                        isLeader={isLeader}
                        isLoading={eventsLoading}
                        selected={selected}
                        markedDates={markedDates}
                        onDayPress={onDayPress}
                      />
                    )}
                  </View>
                </Card>
              </View>
            )}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainContainer}
          />
        </SafeAreaView>
      </View>

      <GroupEventModal
        isVisible={showEventModal}
        onClose={() => setShowEventModal(false)}
        selectedDate={selected}
        selectedEvents={selectedEvents}
        groupId={id || ""}
        isLeader={isLeader}
      />

      {/* Group Chat Modal */}
      <GroupChatModal visible={showChatModal} onDismiss={() => setShowChatModal(false)} groupId={id || ""} groupName={groupDetails?.name || "Group Chat"} />
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  mainContainer: {
    flexGrow: 1,
    paddingBottom: 24
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 3,
    overflow: "hidden"
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  skeletonHero: {
    backgroundColor: "#E9ECEF"
  },
  skeletonText: {
    backgroundColor: "#E9ECEF",
    borderRadius: 4
  },
  skeletonCircle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 50
  }
});

export default GroupDetails;
