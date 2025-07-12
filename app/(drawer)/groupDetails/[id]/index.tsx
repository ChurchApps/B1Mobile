import React from "react";
import { useCallback, useMemo, useState, useEffect } from "react";
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
import GroupChatModal from "../../../../src/components/modals/GroupChatModal";
import { useAppTheme } from "../../../../src/theme";
import { useCurrentUserChurch } from "../../../../src/stores/useUserStore";
import { 
  GroupHeroSection,
  GroupNavigationTabs,
  GroupAboutTab,
  GroupMembersTab,
  GroupCalendarTab,
  GroupEventModal,
  EventProcessor
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


  // Only show full loading if group details is loading (essential data)
  const hasError = groupDetailsIsError || groupMembersIsError || eventsIsError;
  const errors = [groupDetailsError, groupMembersError, eventsError].filter(Boolean);

  const updateTime = useCallback((data: any) => EventProcessor.updateTime(data), []);

  const events = useMemo(() => updateTime(eventsData), [eventsData, updateTime]);


  const [expandedEvents, setExpandedEvents] = useState<EventInterface[]>([]);
  const [isProcessingEvents, setIsProcessingEvents] = useState(false);

  // Async event expansion to prevent UI blocking
  useEffect(() => {
    if (activeTab !== 3 || events.length === 0) {
      setExpandedEvents([]);
      return;
    }


    setIsProcessingEvents(true);

    // Process events asynchronously in chunks to prevent UI blocking
    const processEventsAsync = async () => {
      try {
        // First, provide immediate fallback events
        const simpleEvents = events.slice(0, 10).map(event => ({
          ...event,
          start: event.start ? dayjs(event.start) : null,
          end: event.end ? dayjs(event.end) : null
        }));
        setExpandedEvents(simpleEvents);

        // Then process the full expansion in the background
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI to render
        
        try {
          // Process events with a timeout
          const expansionPromise = new Promise<EventInterface[]>((resolve) => {
            try {
              const expanded = EventProcessor.expandEvents(events);
              resolve(expanded);
            } catch (error) {
              resolve(simpleEvents); // Fallback to simple events
            }
          });
          
          const timeoutPromise = new Promise<EventInterface[]>((resolve) => {
            setTimeout(() => {
              resolve(simpleEvents); // Fallback to simple events
            }, 5000);
          });
          
          // Race between expansion and timeout
          const expanded = await Promise.race([expansionPromise, timeoutPromise]);
          
          // Only update if we got results from expansion
          if (expanded.length > 0) {
            setExpandedEvents(expanded);
          }
        } catch (expansionError) {
          // Keep simple events as fallback
        }
      } catch (error) {
        // Keep the simple events as fallback
      } finally {
        setIsProcessingEvents(false);
      }
    };

    processEventsAsync();
  }, [events, activeTab]);

  const markedDates = useMemo(() => EventProcessor.calculateMarkedDates(expandedEvents, activeTab), [expandedEvents, activeTab]);

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

  // Show minimal loading only for critical group details data
  if (groupDetailsLoading) {
    return (
      <LoadingWrapper loading={true}>
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            <MainHeader title="Loading..." openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigateBack} />
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
    <>
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
                  memberCount={groupMembersLoading ? undefined : groupMembers.length}
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
                        isLoading={isProcessingEvents}
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
