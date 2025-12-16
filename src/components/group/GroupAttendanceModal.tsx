import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Button, IconButton, Avatar, Checkbox, ActivityIndicator, Divider, TextInput } from "react-native-paper";
import Modal from "react-native-modal";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { ApiHelper } from "@churchapps/helpers";
import { Constants, EnvironmentHelper } from "../../helpers";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface SessionInterface {
  id?: string;
  groupId?: string;
  serviceTimeId?: string;
  sessionDate?: Date | string;
  displayName?: string;
}

interface VisitSessionInterface {
  id?: string;
  visitId?: string;
  sessionId?: string;
  visit?: {
    id?: string;
    personId?: string;
  };
}

interface PersonInterface {
  id: string;
  name: { display: string };
  photo?: string;
}

interface GroupMember {
  id: string;
  person: {
    id: string;
    name: { display: string };
    photo?: string;
  };
}

interface GroupAttendanceModalProps {
  visible: boolean;
  onDismiss: () => void;
  groupId: string;
  members: GroupMember[];
}

interface AttendanceState {
  [personId: string]: boolean;
}

interface AttendancePerson {
  id: string;
  name: { display: string };
  photo?: string;
  isMember: boolean;
}

export const GroupAttendanceModal: React.FC<GroupAttendanceModalProps> = ({
  visible,
  onDismiss,
  groupId,
  members
}) => {
  const currentUserChurch = useCurrentUserChurch();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [originalAttendance, setOriginalAttendance] = useState<AttendanceState>({});
  const [sessions, setSessions] = useState<SessionInterface[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Additional people (non-members) added to attendance
  const [additionalPeople, setAdditionalPeople] = useState<PersonInterface[]>([]);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<PersonInterface[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Combined list of all people (members + additional)
  const allPeople = useMemo((): AttendancePerson[] => {
    const memberPeople: AttendancePerson[] = members.map(m => ({
      id: m.person.id,
      name: m.person.name,
      photo: m.person.photo,
      isMember: true
    }));

    const additionalAsPeople: AttendancePerson[] = additionalPeople
      .filter(p => !members.some(m => m.person.id === p.id)) // Exclude if already a member
      .map(p => ({
        id: p.id,
        name: p.name,
        photo: p.photo,
        isMember: false
      }));

    return [...memberPeople, ...additionalAsPeople];
  }, [members, additionalPeople]);

  // Load sessions when modal opens
  useEffect(() => {
    if (visible && currentUserChurch?.jwt && groupId) {
      loadSessions();
    }
  }, [visible, currentUserChurch?.jwt, groupId]);

  // Load attendance when date changes
  useEffect(() => {
    if (visible && sessions.length >= 0) {
      loadAttendanceForDate();
    }
  }, [selectedDate, sessions]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setShowSearch(false);
      setSearchText("");
      setSearchResults([]);
      setAdditionalPeople([]);
    }
  }, [visible]);

  const loadSessions = async () => {
    try {
      const data = await ApiHelper.get(`/sessions?groupId=${groupId}`, "AttendanceApi");
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const loadAttendanceForDate = async () => {
    setIsLoading(true);
    setError(null);

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    // Find existing session for this date
    const existingSession = sessions.find(s => {
      const sessionDateStr = dayjs(s.sessionDate).format("YYYY-MM-DD");
      return sessionDateStr === dateStr;
    });

    setCurrentSession(existingSession || null);

    if (existingSession?.id) {
      try {
        const visitSessions: VisitSessionInterface[] = await ApiHelper.get(
          `/visitsessions?sessionId=${existingSession.id}`,
          "AttendanceApi"
        );

        // Build attendance map from visit sessions
        const attendanceMap: AttendanceState = {};
        const personIds: string[] = [];

        visitSessions.forEach(vs => {
          if (vs.visit?.personId) {
            attendanceMap[vs.visit.personId] = true;
            personIds.push(vs.visit.personId);
          }
        });

        // Find non-members who have attendance records
        const memberIds = members.map(m => m.person.id);
        const nonMemberIds = personIds.filter(id => !memberIds.includes(id));

        if (nonMemberIds.length > 0) {
          // Fetch details for non-member attendees
          const nonMemberDetails = await ApiHelper.get(
            `/people/ids?ids=${nonMemberIds.join(",")}`,
            "MembershipApi"
          );
          setAdditionalPeople(nonMemberDetails || []);
        } else {
          setAdditionalPeople([]);
        }

        setAttendance(attendanceMap);
        setOriginalAttendance({ ...attendanceMap });
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setAttendance({});
        setOriginalAttendance({});
        setAdditionalPeople([]);
      }
    } else {
      // No session exists for this date, start fresh
      setAttendance({});
      setOriginalAttendance({});
      setAdditionalPeople([]);
    }

    setIsLoading(false);
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
  };

  const toggleMember = useCallback((personId: string) => {
    setAttendance(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  }, []);

  const selectAll = useCallback(() => {
    const newAttendance: AttendanceState = {};
    allPeople.forEach(p => {
      newAttendance[p.id] = true;
    });
    setAttendance(newAttendance);
  }, [allPeople]);

  const deselectAll = useCallback(() => {
    setAttendance({});
  }, []);

  const presentCount = useMemo(() => {
    return Object.values(attendance).filter(Boolean).length;
  }, [attendance]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchText.trim()) return;

    Keyboard.dismiss();
    setIsSearching(true);
    try {
      const results = await ApiHelper.get(
        `/people/search/?term=${encodeURIComponent(searchText.trim())}`,
        "MembershipApi"
      );
      setSearchResults(results || []);
    } catch (err) {
      console.error("Failed to search:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPersonToAttendance = (person: PersonInterface) => {
    // Add to additional people if not already there and not a member
    const isAlreadyAdded = additionalPeople.some(p => p.id === person.id);
    const isMember = members.some(m => m.person.id === person.id);

    if (!isAlreadyAdded && !isMember) {
      setAdditionalPeople(prev => [...prev, person]);
    }

    // Mark as present
    setAttendance(prev => ({
      ...prev,
      [person.id]: true
    }));

    // Clear search
    setSearchText("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let sessionId = currentSession?.id;

      // Create session if it doesn't exist (without serviceTimeId - it's optional)
      if (!sessionId) {
        const newSession: SessionInterface = {
          groupId: groupId,
          sessionDate: dayjs(selectedDate).toISOString()
        };

        const createdSessions = await ApiHelper.post("/sessions", [newSession], "AttendanceApi");
        if (createdSessions && createdSessions.length > 0) {
          sessionId = createdSessions[0].id;
          setCurrentSession(createdSessions[0]);
          // Add to local sessions list
          setSessions(prev => [...prev, createdSessions[0]]);
        }
      }

      if (!sessionId) {
        throw new Error("Failed to create session");
      }

      // Determine which people to add and remove
      const toAdd: string[] = [];
      const toRemove: string[] = [];

      allPeople.forEach(p => {
        const personId = p.id;
        const isNowPresent = attendance[personId];
        const wasPreviouslyPresent = originalAttendance[personId];

        if (isNowPresent && !wasPreviouslyPresent) {
          toAdd.push(personId);
        } else if (!isNowPresent && wasPreviouslyPresent) {
          toRemove.push(personId);
        }
      });

      // Add new attendance records using /visitsessions/log (B1Admin pattern)
      for (const personId of toAdd) {
        const visit = {
          checkinTime: new Date(),
          personId: personId,
          visitSessions: [{ sessionId: sessionId }]
        };
        await ApiHelper.post("/visitsessions/log", visit, "AttendanceApi");
      }

      // Remove attendance records
      for (const personId of toRemove) {
        await ApiHelper.delete(
          `/visitsessions?sessionId=${sessionId}&personId=${personId}`,
          "AttendanceApi"
        );
      }

      // Update original attendance to match current
      setOriginalAttendance({ ...attendance });

      onDismiss();
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonItem = useCallback(({ item }: { item: AttendancePerson }) => {
    const isPresent = attendance[item.id] || false;

    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => toggleMember(item.id)}
        activeOpacity={0.7}
      >
        <Avatar.Image
          size={48}
          source={item.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.photo }
            : Constants.Images.ic_member
          }
        />
        <View style={styles.memberInfo}>
          <Text variant="titleMedium" style={styles.memberName}>
            {item.name?.display}
          </Text>
          <Text variant="bodySmall" style={[styles.statusText, isPresent && styles.presentText]}>
            {isPresent ? "Present" : "Absent"}
            {!item.isMember && " (Guest)"}
          </Text>
        </View>
        <Checkbox
          status={isPresent ? "checked" : "unchecked"}
          onPress={() => toggleMember(item.id)}
          color="#4CAF50"
        />
      </TouchableOpacity>
    );
  }, [attendance, toggleMember]);

  const renderSearchResult = ({ item }: { item: PersonInterface }) => {
    const isAlreadyInList = allPeople.some(p => p.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.searchResultCard, isAlreadyInList && styles.searchResultDisabled]}
        onPress={() => !isAlreadyInList && addPersonToAttendance(item)}
        activeOpacity={isAlreadyInList ? 1 : 0.7}
      >
        <Avatar.Image
          size={40}
          source={item.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.photo }
            : Constants.Images.ic_member
          }
        />
        <View style={styles.searchResultInfo}>
          <Text variant="bodyLarge" style={styles.searchResultName}>
            {item.name?.display}
          </Text>
        </View>
        {!isAlreadyInList && (
          <IconButton icon="plus" size={20} iconColor="#4CAF50" />
        )}
        {isAlreadyInList && (
          <Text style={styles.alreadyAddedText}>Added</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onDismiss}
      backdropOpacity={0.5}
      useNativeDriverForBackdrop={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
      propagateSwipe={true}
      coverScreen={true}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={onDismiss} />
          <Text variant="titleLarge" style={styles.title}>
            Attendance for {dayjs(selectedDate).format("MMM D, YYYY")}
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Date Selection */}
        <View style={styles.selectionSection}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconButton icon="calendar" size={20} />
            <Text style={styles.dateButtonText}>
              {dayjs(selectedDate).format("MMMM D, YYYY")}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate}
            mode="date"
            maximumDate={new Date()}
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker(false)}
            title="Select Date"
          />
        </View>

        <Divider />

        {/* Stats and Actions */}
        <View style={styles.statsSection}>
          <Text style={styles.statsText}>
            {presentCount} of {allPeople.length} present
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode="text"
              compact
              onPress={selectAll}
              disabled={isLoading || isSaving}
            >
              All
            </Button>
            <Button
              mode="text"
              compact
              onPress={deselectAll}
              disabled={isLoading || isSaving}
            >
              None
            </Button>
            <Button
              mode="text"
              compact
              icon="account-plus"
              onPress={() => setShowSearch(!showSearch)}
              disabled={isLoading || isSaving}
            >
              Add
            </Button>
          </View>
        </View>

        {/* Search Section */}
        {showSearch && (
          <View style={styles.searchSection}>
            <View style={styles.searchInputRow}>
              <TextInput
                mode="outlined"
                placeholder="Search for a person..."
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
                dense
                onSubmitEditing={handleSearch}
              />
              <Button
                mode="contained"
                onPress={handleSearch}
                loading={isSearching}
                disabled={isSearching || !searchText.trim()}
                compact
                style={styles.searchButton}
              >
                Search
              </Button>
            </View>

            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                style={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            )}

            {searchResults.length === 0 && searchText && !isSearching && (
              <Text style={styles.noResultsText}>No results found</Text>
            )}
          </View>
        )}

        <Divider />

        {/* Member List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        ) : allPeople.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members in this group yet.</Text>
            <Text style={styles.emptySubtext}>Use "Add" to search for people to add.</Text>
          </View>
        ) : (
          <FlatList
            data={allPeople}
            renderItem={renderPersonItem}
            keyExtractor={(item) => item.id}
            style={styles.memberList}
            contentContainerStyle={styles.memberListContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isSaving}
            disabled={isLoading || isSaving}
          >
            Save Attendance
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end"
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "100%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  title: {
    fontWeight: "600",
    color: "#3c3c3c",
    flex: 1,
    textAlign: "center"
  },
  selectionSection: {
    padding: 16
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F8",
    borderRadius: 8,
    paddingRight: 16
  },
  dateButtonText: {
    fontSize: 16,
    color: "#3c3c3c"
  },
  statsSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },
  actionButtons: {
    flexDirection: "row"
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  searchButton: {
    marginTop: 6
  },
  searchResultsList: {
    maxHeight: 150,
    marginTop: 8
  },
  searchResultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F8",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4
  },
  searchResultDisabled: {
    opacity: 0.5
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12
  },
  searchResultName: {
    color: "#3c3c3c"
  },
  alreadyAddedText: {
    color: "#9E9E9E",
    fontSize: 12,
    marginRight: 8
  },
  noResultsText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginTop: 12
  },
  memberList: {
    flex: 1
  },
  memberListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600"
  },
  statusText: {
    color: "#9E9E9E",
    marginTop: 2
  },
  presentText: {
    color: "#4CAF50"
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 12,
    color: "#666"
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  emptyText: {
    color: "#666",
    textAlign: "center"
  },
  emptySubtext: {
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 8,
    fontSize: 12
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 8
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0"
  },
  saveButton: {
    borderRadius: 8
  }
});
