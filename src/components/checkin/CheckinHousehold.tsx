import { ApiHelper, CheckinHelper, Constants, EnvironmentHelper, PersonInterface, ServiceTimeInterface } from "../../../src/helpers";
import { ErrorHelper } from "../../mobilehelper";
import React, { useState } from "react";
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useAppTheme } from "../../../src/theme";
import { Button, Divider, Card, Text, Chip } from "react-native-paper";
import { OptimizedImage } from "../OptimizedImage";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  onDone: () => void;
  showGroups: (member: PersonInterface, time: ServiceTimeInterface) => void;
}

export const CheckinHousehold = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  // Debug logging
  console.log("CheckinHousehold - householdMembers:", CheckinHelper.householdMembers);
  console.log("CheckinHousehold - serviceTimes:", CheckinHelper.serviceTimes);
  console.log("CheckinHousehold - groupTree:", CheckinHelper.groupTree);

  const submitAttendance = async () => {
    setLoading(true);
    let pendingVisits: any[] = [];
    CheckinHelper.householdMembers?.forEach((member: any) => {
      let visitSessionList: any[] = [];
      member.serviceTimes?.forEach((time: any) => {
        if (time.selectedGroup != null) {
          visitSessionList.push({ session: { serviceTimeId: time.id, groupId: time.selectedGroup.id, displayName: time.selectedGroup.name } });
        }
      });
      if (visitSessionList.length != 0) {
        pendingVisits.push({ personId: member.id, serviceId: CheckinHelper.serviceId, visitSessions: visitSessionList });
      }
    });

    ApiHelper.post("/visits/checkin?serviceId=" + CheckinHelper.serviceId + "&peopleIds=" + CheckinHelper.peopleIds, pendingVisits, "AttendanceApi");
    setLoading(false);
    try {
      CheckinHelper.householdMembers = [];
      CheckinHelper.groupTree = null;
      props.onDone();
    } catch (error: any) {
      ErrorHelper.logError("submit-attendance", error);
    }
  };

  const renderMemberItem = (item: any) => (
    <Card style={styles.memberCard}>
      <TouchableOpacity onPress={() => setSelected(selected != item.id ? item.id : null)} activeOpacity={0.7} style={styles.memberHeader}>
        <View style={styles.memberHeaderContent}>
          <View style={styles.memberImageContainer}>
            <OptimizedImage source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={styles.memberImage} placeholder={Constants.Images.ic_member} />
          </View>

          <View style={styles.memberInfo}>
            <Text variant="titleLarge" style={styles.memberName}>
              {item.name.display}
            </Text>
            {selected !== item.id && (
              <View style={styles.memberSummary}>
                {item.serviceTimes
                  .filter((time: any) => time.selectedGroup)
                  .map((time: any, index: number) => (
                    <Chip key={index} mode="outlined" style={styles.summaryChip} textStyle={styles.summaryChipText}>
                      {time.selectedGroup.name}
                    </Chip>
                  ))}
                {item.serviceTimes.filter((time: any) => time.selectedGroup).length === 0 && (
                  <Text variant="bodyMedium" style={styles.noSelectionText}>
                    Tap to select groups
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.expandIcon}>
            <MaterialIcons name={selected === item.id ? "expand-less" : "expand-more"} size={24} color="#9E9E9E" />
          </View>
        </View>
      </TouchableOpacity>

      {selected === item.id && item.serviceTimes && (
        <View style={styles.serviceTimesContainer}>
          <Divider style={styles.divider} />
          {item.serviceTimes.map((item_time: any) => (
            <View key={`service-time-${item_time.id}`} style={styles.serviceTimeItem}>
              <View style={styles.serviceTimeInfo}>
                <View style={styles.serviceTimeIconContainer}>
                  <MaterialIcons name="schedule" size={20} color="#0D47A1" />
                </View>
                <View style={styles.serviceTimeDetails}>
                  <Text variant="titleMedium" style={styles.serviceTimeName}>
                    {item_time.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.selectedGroupText}>
                    {item_time.selectedGroup ? item_time.selectedGroup.name : "No group selected"}
                  </Text>
                </View>
              </View>
              <Button mode={item_time.selectedGroup ? "contained" : "outlined"} onPress={() => !item_time.selection && props.showGroups(item, item_time)} style={[styles.selectGroupButton, item_time.selectedGroup && styles.selectedGroupButton]} labelStyle={[styles.selectGroupButtonText, item_time.selectedGroup && styles.selectedGroupButtonText]} disabled={item_time.selection}>
                {item_time.selectedGroup ? "Change" : "Select Group"}
              </Button>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <LoadingWrapper loading={loading}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconHeaderContainer}>
            <MaterialIcons name="people" size={48} color="#0D47A1" />
          </View>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Household Members
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Select groups for each family member
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.contentSection}>
          {!CheckinHelper.householdMembers || CheckinHelper.householdMembers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <MaterialIcons name="person-off" size={64} color="#9E9E9E" />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No Household Members Found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  Please ensure you are logged in and have household members registered.
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList data={CheckinHelper.householdMembers} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={styles.membersList} contentContainerStyle={styles.membersContent} showsVerticalScrollIndicator={false} />
          )}
        </View>

        {/* Bottom Action */}
        <View style={styles.bottomSection}>
          <Button mode="contained" onPress={submitAttendance} style={styles.checkinButton} labelStyle={styles.checkinButtonText} icon="check-circle">
            Complete Check-in
          </Button>
        </View>
      </View>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  headerSection: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 16
  },
  iconHeaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  headerTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  headerSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    maxWidth: "80%"
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  membersList: {
    flex: 1
  },
  membersContent: {
    paddingBottom: 16
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  memberHeader: {
    borderRadius: 12
  },
  memberHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  memberImageContainer: {
    marginRight: 16
  },
  memberImage: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8
  },
  memberSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  summaryChip: {
    backgroundColor: "rgba(13, 71, 161, 0.1)",
    borderColor: "#0D47A1"
  },
  summaryChipText: {
    color: "#0D47A1",
    fontSize: 12
  },
  noSelectionText: {
    color: "#9E9E9E",
    fontStyle: "italic"
  },
  expandIcon: {
    justifyContent: "center",
    alignItems: "center"
  },
  serviceTimesContainer: {
    backgroundColor: "#F6F6F8"
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0"
  },
  serviceTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  serviceTimeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  serviceTimeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  serviceTimeDetails: {
    flex: 1
  },
  serviceTimeName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  selectedGroupText: {
    color: "#9E9E9E"
  },
  selectGroupButton: {
    borderRadius: 8,
    minWidth: 100
  },
  selectedGroupButton: {
    backgroundColor: "#70DC87"
  },
  selectGroupButtonText: {
    fontSize: 12,
    fontWeight: "600"
  },
  selectedGroupButtonText: {
    color: "#FFFFFF"
  },
  bottomSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0"
  },
  checkinButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  checkinButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    padding: 32,
    alignItems: "center"
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});
