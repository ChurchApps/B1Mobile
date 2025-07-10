import React from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { Text, TouchableRipple, Button, Surface, Avatar, Card, Chip, IconButton } from "react-native-paper";
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

const TABS = ["About", "Conversations", "Group Members", "Group Calendar"];

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
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <MainHeader title={name} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />
          
          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <View>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                  {photoUrl ? (
                    <Card style={styles.heroCard}>
                      <View style={styles.heroImageContainer}>
                        <OptimizedImage source={{ uri: photoUrl }} style={styles.heroImage} contentFit="cover" priority="high" />
                        <View style={styles.heroOverlay}>
                          <Text variant="headlineLarge" style={styles.heroTitle}>
                            {name}
                          </Text>
                          <View style={styles.heroStats}>
                            <Chip icon="account-group" style={styles.statsChip}>
                              {groupMembers.length} members
                            </Chip>
                            {isLeader && (
                              <Chip icon="crown" style={[styles.statsChip, styles.leaderChip]}>
                                Leader
                              </Chip>
                            )}
                          </View>
                        </View>
                      </View>
                    </Card>
                  ) : (
                    <Card style={styles.heroCard}>
                      <View style={[styles.heroImageContainer, styles.noImageHero]}>
                        <View style={styles.heroOverlay}>
                          <Text variant="headlineLarge" style={styles.heroTitle}>
                            {name}
                          </Text>
                          <View style={styles.heroStats}>
                            <Chip icon="account-group" style={styles.statsChip}>
                              {groupMembers.length} members
                            </Chip>
                            {isLeader && (
                              <Chip icon="crown" style={[styles.statsChip, styles.leaderChip]}>
                                Leader
                              </Chip>
                            )}
                          </View>
                        </View>
                      </View>
                    </Card>
                  )}
                </View>

                {/* Navigation Buttons */}
                <Card style={styles.navigationCard}>
                  <Card.Content>
                    <View style={styles.navigationGrid}>
                      <TouchableOpacity 
                        style={[styles.navButton, activeTab === 0 && styles.activeNavButton]} 
                        onPress={() => setActiveTab(0)}>
                        <View style={styles.navButtonIcon}>
                          <Avatar.Icon size={40} icon="information" style={[styles.navButtonAvatar, activeTab === 0 && styles.activeNavButtonAvatar]} />
                        </View>
                        <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 0 && styles.activeNavButtonText]}>About</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.navButton, activeTab === 1 && styles.activeNavButton]} 
                        onPress={() => setActiveTab(1)}>
                        <View style={styles.navButtonIcon}>
                          <Avatar.Icon size={40} icon="chat" style={[styles.navButtonAvatar, activeTab === 1 && styles.activeNavButtonAvatar]} />
                        </View>
                        <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 1 && styles.activeNavButtonText]}>Messages</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.navButton, activeTab === 2 && styles.activeNavButton]} 
                        onPress={() => setActiveTab(2)}>
                        <View style={styles.navButtonIcon}>
                          <Avatar.Icon size={40} icon="account-group" style={[styles.navButtonAvatar, activeTab === 2 && styles.activeNavButtonAvatar]} />
                        </View>
                        <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 2 && styles.activeNavButtonText]}>Members</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.navButton, activeTab === 3 && styles.activeNavButton]} 
                        onPress={() => setActiveTab(3)}>
                        <View style={styles.navButtonIcon}>
                          <Avatar.Icon size={40} icon="calendar" style={[styles.navButtonAvatar, activeTab === 3 && styles.activeNavButtonAvatar]} />
                        </View>
                        <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 3 && styles.activeNavButtonText]}>Events</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>

                {/* Content Display */}
                <Card style={styles.contentCard}>
                  {/* Tab Content */}
                  <View style={styles.tabContent}>
                    {activeTab === 0 && (
                      <View style={styles.aboutContainer}>
                        {about ? (
                          <Markdown style={styles.markdownStyles}>{about}</Markdown>
                        ) : (
                          <View style={styles.emptyState}>
                            <Avatar.Icon size={64} icon="information" style={styles.emptyIcon} />
                            <Text variant="titleMedium" style={styles.emptyTitle}>
                              No description available
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtitle}>
                              Group details will appear here when added
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {activeTab === 1 && (
                      <View style={styles.conversationsContainer}>
                        <Conversations contentType="group" contentId={id} groupId={id} from="GroupDetails" />
                      </View>
                    )}
                    
                    {activeTab === 2 && (
                      <View style={styles.membersContainer}>
                        {groupMembers.length > 0 ? (
                          <View>
                            {groupMembers.map((item: any) => (
                              <Card key={item?.id} style={styles.modernMemberCard}>
                                <Card.Content style={styles.memberCardContent}>
                                  <Avatar.Image 
                                    size={56} 
                                    source={item?.person?.photo ? { uri: EnvironmentHelper.ContentRoot + item.person.photo } : Constants.Images.ic_member} 
                                  />
                                  <View style={styles.memberInfo}>
                                    <Text variant="titleMedium" style={styles.memberName}>
                                      {item?.person?.name?.display}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.memberRole}>
                                      Group Member
                                    </Text>
                                  </View>
                                  <IconButton
                                    icon="dots-vertical"
                                    size={20}
                                    onPress={() => {}}
                                  />
                                </Card.Content>
                              </Card>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.emptyState}>
                            <Avatar.Icon size={64} icon="account-group" style={styles.emptyIcon} />
                            <Text variant="titleMedium" style={styles.emptyTitle}>
                              No members found
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtitle}>
                              Members will appear here when they join
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {activeTab === 3 && (
                      <View style={styles.calendarContainer}>
                        {isLeader && (
                          <Button
                            mode="contained"
                            icon="calendar-plus"
                            onPress={() => {
                              setShowAddEventModal(true);
                              handleAddEvent({ start: new Date(), end: new Date() });
                            }}
                            style={styles.addEventButton}>
                            Add Event
                          </Button>
                        )}
                        <Calendar
                          current={selected}
                          markingType="multi-dot"
                          markedDates={markedDates}
                          onDayPress={onDayPress}
                          theme={{
                            backgroundColor: theme.colors.surface,
                            calendarBackground: theme.colors.surface,
                            textSectionTitleColor: theme.colors.primary,
                            selectedDayBackgroundColor: theme.colors.primary,
                            selectedDayTextColor: theme.colors.onPrimary,
                            todayTextColor: theme.colors.primary,
                            dayTextColor: theme.colors.onSurface,
                            textDisabledColor: theme.colors.onSurfaceDisabled,
                            arrowColor: theme.colors.primary,
                            monthTextColor: theme.colors.onSurface,
                            indicatorColor: theme.colors.primary,
                            textDayFontWeight: '500',
                            textMonthFontWeight: '600',
                            textDayHeaderFontWeight: '600'
                          }}
                        />
                      </View>
                    )}
                  </View>
                </Card>
              </View>
            )}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainContainer}
          />
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
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  mainContainer: {
    flexGrow: 1,
    paddingBottom: 24
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroImageContainer: {
    height: 220,
    position: "relative"
  },
  noImageHero: {
    backgroundColor: "#1565C0",
    justifyContent: "center"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  heroStats: {
    flexDirection: "row",
    gap: 8
  },
  statsChip: {
    backgroundColor: "rgba(255, 255, 255, 0.9)"
  },
  leaderChip: {
    backgroundColor: "rgba(255, 193, 7, 0.9)"
  },
  
  markdownStyles: {
    body: {
      color: "#3c3c3c",
      fontSize: 16,
      lineHeight: 24
    }
  },
  
  // Navigation Buttons
  navigationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3
  },
  navigationGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F6F6F8"
  },
  activeNavButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#1565C0"
  },
  navButtonIcon: {
    marginBottom: 4
  },
  navButtonAvatar: {
    backgroundColor: "#9E9E9E"
  },
  activeNavButtonAvatar: {
    backgroundColor: "#1565C0"
  },
  navButtonText: {
    color: "#9E9E9E",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 12
  },
  activeNavButtonText: {
    color: "#1565C0",
    fontWeight: "700",
    fontSize: 11,
    lineHeight: 12
  },
  
  // Content Card
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
  
  // About
  aboutContainer: {
    minHeight: 200
  },
  
  // Conversations
  conversationsContainer: {
    minHeight: 300
  },
  
  // Members
  membersContainer: {
    minHeight: 200
  },
  membersList: {
    gap: 12
  },
  modernMemberCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  memberCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  memberRole: {
    color: "#9E9E9E"
  },
  
  // Empty States
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },
  
  // Calendar
  calendarContainer: {
    minHeight: 350
  },
  addEventButton: {
    marginBottom: 16,
    backgroundColor: "#70DC87"
  },
  
  // Legacy styles for backward compatibility
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
