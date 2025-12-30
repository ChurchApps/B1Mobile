import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Keyboard } from "react-native";
import { Text, Button, IconButton, Avatar, Checkbox, ActivityIndicator, Divider, TextInput } from "react-native-paper";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
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

interface GroupAttendanceTabProps {
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

export const GroupAttendanceTab: React.FC<GroupAttendanceTabProps> = ({
  groupId,
  members
}) => {
  const { t } = useTranslation();
  const currentUserChurch = useCurrentUserChurch();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [originalAttendance, setOriginalAttendance] = useState<AttendanceState>({});
  const [sessions, setSessions] = useState<SessionInterface[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      .filter(p => !members.some(m => m.person.id === p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        photo: p.photo,
        isMember: false
      }));

    return [...memberPeople, ...additionalAsPeople];
  }, [members, additionalPeople]);

  // Load sessions on mount
  useEffect(() => {
    if (currentUserChurch?.jwt && groupId) {
      loadSessions();
    }
  }, [currentUserChurch?.jwt, groupId]);

  // Load attendance when date or sessions change
  useEffect(() => {
    if (sessions.length >= 0 && groupId) {
      loadAttendanceForDate();
    }
  }, [selectedDate, sessions, groupId]);

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
    setSuccessMessage(null);

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

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

        const attendanceMap: AttendanceState = {};
        const personIds: string[] = [];

        visitSessions.forEach(vs => {
          if (vs.visit?.personId) {
            attendanceMap[vs.visit.personId] = true;
            personIds.push(vs.visit.personId);
          }
        });

        const memberIds = members.map(m => m.person.id);
        const nonMemberIds = personIds.filter(id => !memberIds.includes(id));

        if (nonMemberIds.length > 0) {
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
    const isAlreadyAdded = additionalPeople.some(p => p.id === person.id);
    const isMember = members.some(m => m.person.id === person.id);

    if (!isAlreadyAdded && !isMember) {
      setAdditionalPeople(prev => [...prev, person]);
    }

    setAttendance(prev => ({
      ...prev,
      [person.id]: true
    }));

    setSearchText("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let sessionId = currentSession?.id;

      if (!sessionId) {
        const newSession: SessionInterface = {
          groupId: groupId,
          sessionDate: dayjs(selectedDate).toISOString()
        };

        const createdSessions = await ApiHelper.post("/sessions", [newSession], "AttendanceApi");
        if (createdSessions && createdSessions.length > 0) {
          sessionId = createdSessions[0].id;
          setCurrentSession(createdSessions[0]);
          setSessions(prev => [...prev, createdSessions[0]]);
        }
      }

      if (!sessionId) {
        throw new Error("Failed to create session");
      }

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

      for (const personId of toAdd) {
        const visit = {
          checkinTime: new Date(),
          personId: personId,
          visitSessions: [{ sessionId: sessionId }]
        };
        await ApiHelper.post("/visitsessions/log", visit, "AttendanceApi");
      }

      for (const personId of toRemove) {
        await ApiHelper.delete(
          `/visitsessions?sessionId=${sessionId}&personId=${personId}`,
          "AttendanceApi"
        );
      }

      setOriginalAttendance({ ...attendance });
      setSuccessMessage("Attendance saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonItem = ({ item }: { item: AttendancePerson }) => {
    const isPresent = attendance[item.id] || false;

    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => toggleMember(item.id)}
        activeOpacity={0.7}
      >
        <Avatar.Image
          size={44}
          source={item.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.photo }
            : Constants.Images.ic_member
          }
        />
        <View style={styles.memberInfo}>
          <Text variant="bodyLarge" style={styles.memberName}>
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
          color="#2563EB"
        />
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }: { item: PersonInterface }) => {
    const isAlreadyInList = allPeople.some(p => p.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.searchResultCard, isAlreadyInList && styles.searchResultDisabled]}
        onPress={() => !isAlreadyInList && addPersonToAttendance(item)}
        activeOpacity={isAlreadyInList ? 1 : 0.7}
      >
        <Avatar.Image
          size={36}
          source={item.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.photo }
            : Constants.Images.ic_member
          }
        />
        <View style={styles.searchResultInfo}>
          <Text variant="bodyMedium" style={styles.searchResultName}>
            {item.name?.display}
          </Text>
        </View>
        {!isAlreadyInList && (
          <IconButton icon="plus" size={18} iconColor="#2563EB" />
        )}
        {isAlreadyInList && (
          <Text style={styles.alreadyAddedText}>Added</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date Selection */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <IconButton icon="calendar" size={20} iconColor="#2563EB" style={styles.dateIcon} />
        <Text style={styles.dateButtonText}>
          {dayjs(selectedDate).format("MMMM D, YYYY")}
        </Text>
        <IconButton icon="chevron-down" size={18} iconColor="#6B7280" />
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
            labelStyle={styles.actionButtonLabel}
          >
            All
          </Button>
          <Button
            mode="text"
            compact
            onPress={deselectAll}
            disabled={isLoading || isSaving}
            labelStyle={styles.actionButtonLabel}
          >
            None
          </Button>
          <Button
            mode="text"
            compact
            icon="account-plus"
            onPress={() => setShowSearch(!showSearch)}
            disabled={isLoading || isSaving}
            labelStyle={styles.actionButtonLabel}
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
              placeholder={t("groups.searchForPerson")}
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              dense
              onSubmitEditing={handleSearch}
              outlineColor="#E5E7EB"
              activeOutlineColor="#2563EB"
            />
            <Button
              mode="contained"
              onPress={handleSearch}
              loading={isSearching}
              disabled={isSearching || !searchText.trim()}
              compact
              style={styles.searchButton}
              buttonColor="#2563EB"
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

      <Divider style={styles.divider} />

      {/* Member List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t("groups.loadingAttendance")}</Text>
        </View>
      ) : allPeople.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Avatar.Icon size={56} icon="account-group" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{t("groups.noMembersYet")}</Text>
          <Text style={styles.emptySubtext}>{t("groups.useAddToSearch")}</Text>
        </View>
      ) : (
        <FlatList
          data={allPeople}
          renderItem={renderPersonItem}
          keyExtractor={(item) => item.id}
          style={styles.memberList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}

      {/* Messages */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {successMessage && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        loading={isSaving}
        disabled={isLoading || isSaving}
        buttonColor="#2563EB"
      >
        Save Attendance
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 4,
    paddingRight: 4,
    marginBottom: 12
  },
  dateIcon: {
    margin: 0
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937"
  },
  statsSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  statsText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500"
  },
  actionButtons: {
    flexDirection: "row"
  },
  actionButtonLabel: {
    fontSize: 13
  },
  searchSection: {
    marginBottom: 12
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: 40
  },
  searchButton: {
    marginTop: 6,
    borderRadius: 8
  },
  searchResultsList: {
    maxHeight: 140,
    marginTop: 8
  },
  searchResultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4
  },
  searchResultDisabled: {
    opacity: 0.5
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 10
  },
  searchResultName: {
    color: "#1F2937"
  },
  alreadyAddedText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginRight: 8
  },
  noResultsText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 13
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#E5E7EB"
  },
  memberList: {
    marginBottom: 16
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12
  },
  memberName: {
    color: "#1F2937",
    fontWeight: "500"
  },
  statusText: {
    color: "#9CA3AF",
    marginTop: 1
  },
  presentText: {
    color: "#10B981"
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32
  },
  emptyIcon: {
    backgroundColor: "#F3F4F6",
    marginBottom: 12
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500"
  },
  emptySubtext: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
    fontSize: 13
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 13
  },
  successContainer: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  successText: {
    color: "#059669",
    textAlign: "center",
    fontSize: 13
  },
  saveButton: {
    borderRadius: 10,
    marginTop: 4
  }
});
