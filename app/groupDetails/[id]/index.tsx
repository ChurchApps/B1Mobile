import React, { useLayoutEffect } from "react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import { Text, Button, Surface, Card } from "react-native-paper";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useNavigation } from "../../../src/hooks";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useQuery } from "@tanstack/react-query";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "@churchapps/helpers";
import { MainHeader } from "../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import GroupChatModal from "../../../src/components/modals/GroupChatModal";
import { useAppTheme } from "../../../src/theme";
import { useCurrentUserChurch } from "../../../src/stores/useUserStore";
import {
  GroupHeroSection,
  GroupNavigationTabs,
  GroupAboutTab,
  GroupMembersTab,
  GroupCalendarTab,
  GroupEventModal,
  EventProcessor
} from "../../../src/components/group/exports";
import { GroupResourcesTab } from "@/components/group/GroupResourcesTab";
import { useScreenHeader } from "@/hooks/useNavigationHeader";
import { useTranslation } from "react-i18next";

dayjs.extend(utc);
dayjs.extend(timezone);

const GroupDetails = () => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigationBackNormal } = useNavigation();
  const { id, activeTab: initialActiveTab } = useLocalSearchParams<{ id: string; activeTab?: string }>();
  const [activeTab, setActiveTab] = useState(initialActiveTab ? parseInt(initialActiveTab) : 0);

  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD")); // Always default to today
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM-DD")); // Track current calendar month
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvents, setSelectedEvents] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const currentUserChurch = useCurrentUserChurch();

  // Refresh events when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - refreshing events');
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
      errorMessage: t("groups.failedToLoad")
    }
  });

  useScreenHeader({
    title: groupDetails?.name,
    placeholder: t("groups.groupDetails"),
    dependencies: [groupDetails],
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

  // Only show full loading if group details is loading (essential data)
  const hasError = groupDetailsIsError || groupMembersIsError || eventsIsError;
  const errors = [groupDetailsError, groupMembersError, eventsError].filter(Boolean);

  const updateTime = useCallback((data: any) => EventProcessor.updateTime(data), []);

  const events = useMemo(() => {
    // Only process events when on the Events tab
    if (activeTab !== 3) {
      return [];
    }
    const processed = updateTime(eventsData);
    console.log('Events useMemo - processed events:', processed?.length, 'events');
    if (processed?.length > 0) {
      console.log('Sample processed event:', {
        id: processed[0].id,
        title: processed[0].title,
        start: processed[0].start
      });
    }
    return processed;
  }, [eventsData, updateTime, activeTab]);


  const [expandedEvents, setExpandedEvents] = useState<EventInterface[]>([]);
  const [isProcessingEvents, setIsProcessingEvents] = useState(false);

  // Trigger refetch when switching to events tab
  useEffect(() => {
    if (activeTab === 3 && currentUserChurch?.jwt) {
      console.log('Switched to events tab - refetching events');
      refetchEvents();
    }
  }, [activeTab, currentUserChurch?.jwt, refetchEvents]);

  // Async event expansion to prevent UI blocking - now month-based
  useEffect(() => {
    if (activeTab !== 3 || events.length === 0) {
      setExpandedEvents([]);
      setIsProcessingEvents(false);
      return;
    }

    setIsProcessingEvents(true);

    // Process events synchronously for the current month only
    const processEventsSync = () => {
      try {
        // Force fresh calculation by including timestamp in cache key
        const expanded = EventProcessor.expandEventsForMonth(events, currentMonth);
        setExpandedEvents(expanded);
      } catch (error) {
        console.error('Event expansion failed:', error);
        setExpandedEvents([]);
      } finally {
        setIsProcessingEvents(false);
      }
    };

    // Process immediately for faster response
    processEventsSync();
  }, [events, activeTab, currentMonth, eventsData?.length]); // Add eventsData.length to force recalc on data change

  const markedDates = useMemo(() => {
    const marked = EventProcessor.calculateMarkedDates(expandedEvents, activeTab);
    console.log('markedDates useMemo - expandedEvents count:', expandedEvents?.length);
    if (expandedEvents?.length > 0) {
      console.log('markedDates useMemo - sample expanded event:', {
        id: expandedEvents[0].id,
        title: expandedEvents[0].title,
        start: expandedEvents[0].start
      });
    }
    return marked;
  }, [expandedEvents, activeTab]);

  const onDayPress = useCallback(
    (day: DateData) => {
      setSelected(day.dateString);
      const selectedDayEvents = markedDates[day.dateString]?.events || [];
      console.log('onDayPress - selectedDayEvents for', day.dateString, ':', selectedDayEvents.map(e => ({ id: e.id, title: e.title })));
      if (selectedDayEvents.length !== 0) {
        setShowEventModal(true);
        setSelectedEvents(selectedDayEvents);
      }
    },
    [markedDates]
  );

  const onMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(month.dateString);
  }, []);

  // Show minimal loading only for critical group details data
  if (groupDetailsLoading || (!groupDetails && !groupDetailsError)) {
    return (
      <LoadingWrapper loading={true}>
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            <MainHeader title="Loading..." openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigationBackNormal} />
          </SafeAreaView>
        </View>
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
            navigationBackNormal();
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
        <Button mode="contained" onPress={() => navigationBackNormal()}>
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
        <Button mode="contained" onPress={() => navigationBackNormal()}>
          Go Back
        </Button>
      </Surface>
    );
  }

  let isLeader = false;
  currentUserChurch?.groups?.forEach((g: any) => {
    if (g.id === id && g.leader) isLeader = true;
  });

  const tabs = [
    { key: "about", label: t("common.about"), icon: "information" },
    { key: "messages", label: t("messages.messages"), icon: "chat", onPress: () => setShowChatModal(true) },
    { key: "members", label: t("checkin.householdMembers"), icon: "account-group" },
    { key: "events", label: t("events.createEvent"), icon: "calendar" },
    { key: "Resources", label: t("common.resources"), icon: "file" },
  ];

  return (
    <>
      <View style={[styles.container, (showEventModal || showChatModal) && { display: 'none' }]}>
          <MainHeader title={name} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigationBackNormal} />

          <FlatList
            data={[{ key: "content" }]}
            renderItem={() => (
              <View>
                {/* Hero Section */}
                <GroupHeroSection
                  name={name}
                  photoUrl={photoUrl}
                  memberCount={groupMembersLoading ? undefined : groupMembers.length}
                  isLeader={isLeader}
                />

                {/* Navigation Buttons */}
                <GroupNavigationTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  tabs={tabs}
                />

                {/* Content Display */}
                {activeTab !== 4 && <Card style={styles.contentCard}>
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
                        isLoading={isProcessingEvents}
                        selected={selected}
                        markedDates={markedDates}
                        onDayPress={onDayPress}
                        onMonthChange={onMonthChange}
                      />
                    )}
                  </View>
                </Card>
                }
                {activeTab === 4 && (
                  <GroupResourcesTab
                    groupId={id || ""}
                  />
                )}
              </View>
            )}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainContainer}
          />
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
      <GroupChatModal visible={showChatModal} onDismiss={() => setShowChatModal(false)} groupId={id || ""} groupName={groupDetails?.name || t("groups.groupChat")} />
    </>
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
  }
});

export default GroupDetails;
