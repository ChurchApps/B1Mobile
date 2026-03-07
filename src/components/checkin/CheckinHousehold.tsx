import { ApiHelper } from "@/helpers/index";
import { CheckinHelper } from "@/helpers/CheckinHelper";
import { PersonInterface, ServiceTimeInterface } from "@/helpers/Interfaces";
import { ErrorHelper } from "../../helpers/ErrorHelper";
import React, { useState } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useThemeColors } from "../../../src/theme";
import { Button, Divider, Card, Text, Chip } from "react-native-paper";
import { Avatar } from "../common/Avatar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

interface Props {
  onDone: () => void;
  showGroups: (member: PersonInterface, time: ServiceTimeInterface) => void;
  handleBack: () => void;
}

export const CheckinHousehold = (props: Props) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitAttendance = async () => {
    setLoading(true);
    const pendingVisits: any[] = [];
    CheckinHelper.householdMembers?.forEach((member: any) => {
      const visitSessionList: any[] = [];
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
    <Card style={[styles.memberCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
      <TouchableOpacity onPress={() => setSelected(selected != item.id ? item.id : null)} activeOpacity={0.7} style={styles.memberHeader}>
        <View style={styles.memberHeaderContent}>
          <View style={styles.memberImageContainer}>
            <Avatar size={56} photoUrl={item.photo} firstName={item.name?.first} lastName={item.name?.last} />
          </View>

          <View style={styles.memberInfo}>
            <Text variant="titleLarge" style={[styles.memberName, { color: colors.text }]}>
              {item.name.display}
            </Text>
            {selected !== item.id && (
              <View style={styles.memberSummary}>
                {item.serviceTimes
                  .filter((time: any) => time.selectedGroup)
                  .map((time: any, index: number) => (
                    <Chip key={index} mode="outlined" style={[styles.summaryChip, { backgroundColor: colors.primary + "1A", borderColor: colors.primary }]} textStyle={[styles.summaryChipText, { color: colors.primary }]}>
                      {time.selectedGroup.name}
                    </Chip>
                  ))}
                {item.serviceTimes.filter((time: any) => time.selectedGroup).length === 0 && (
                  <Text variant="bodyMedium" style={[styles.noSelectionText, { color: colors.textMuted }]}>
                    {t("checkin.tapToSelectGroups")}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.expandIcon}>
            <MaterialIcons name={selected === item.id ? "expand-less" : "expand-more"} size={24} color={colors.iconColor} />
          </View>
        </View>
      </TouchableOpacity>

      {selected === item.id && item.serviceTimes && (
        <View style={[styles.serviceTimesContainer, { backgroundColor: colors.background }]}>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          {item.serviceTimes.map((item_time: any) => (
            <View key={`service-time-${item_time.id}`} style={[styles.serviceTimeItem, { borderBottomColor: colors.border }]}>
              <View style={styles.serviceTimeInfo}>
                <View style={[styles.serviceTimeIconContainer, { backgroundColor: colors.card }]}>
                  <MaterialIcons name="schedule" size={20} color={colors.primary} />
                </View>
                <View style={styles.serviceTimeDetails}>
                  <Text variant="titleMedium" style={[styles.serviceTimeName, { color: colors.text }]}>
                    {item_time.name}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.selectedGroupText, { color: colors.textMuted }]}>
                    {item_time.selectedGroup ? item_time.selectedGroup.name : t("checkin.noGroupSelected")}
                  </Text>
                </View>
              </View>
              <Button mode={item_time.selectedGroup ? "contained" : "outlined"} onPress={() => !item_time.selection && props.showGroups(item, item_time)} style={[styles.selectGroupButton, item_time.selectedGroup && { backgroundColor: colors.success }]} labelStyle={[styles.selectGroupButtonText, item_time.selectedGroup && { color: colors.white }]} disabled={item_time.selection}>
                {item_time.selectedGroup ? t("checkin.change") : t("checkin.selectGroup")}
              </Button>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <LoadingWrapper loading={loading}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.iconHeaderContainer, { backgroundColor: colors.iconBackground }]}>
            <MaterialIcons name="people" size={48} color={colors.primary} />
          </View>
          <Text variant="headlineLarge" style={[styles.headerTitle, { color: colors.text }]}>
            {t("checkin.householdMembers")}
          </Text>
          <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t("checkin.selectGroupsForFamily")}
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.contentSection}>
          {!CheckinHelper.householdMembers || CheckinHelper.householdMembers.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
              <View style={styles.emptyContent}>
                <MaterialIcons name="person-off" size={64} color={colors.iconColor} />
                <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("checkin.noHouseholdMembers")}
                </Text>
                <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t("checkin.noHouseholdMembersMessage")}
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList data={CheckinHelper.householdMembers} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={styles.membersList} contentContainerStyle={styles.membersContent} showsVerticalScrollIndicator={false} />
          )}
        </View>

        {/* Bottom Action */}
        <View style={[styles.bottomSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button mode="contained" onPress={props?.handleBack} style={[styles.checkinButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} labelStyle={[styles.checkinButtonText, { color: colors.onPrimary }]}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} style={{ marginRight: 8 }} />
          </Button>
          <Button mode="contained" onPress={submitAttendance} style={[styles.checkinButton, { flex: 1, backgroundColor: colors.primary, shadowColor: colors.primary }]} labelStyle={[styles.checkinButtonText, { color: colors.onPrimary }]} icon="check-circle">
            {t("checkin.completeCheckin")}
          </Button>
        </View>
      </View>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerSection: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 16
  },
  iconHeaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  headerTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  headerSubtitle: {
    textAlign: "center",
    maxWidth: "80%"
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  membersList: { flex: 1 },
  membersContent: { paddingBottom: 16 },
  memberCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  memberHeader: { borderRadius: 12 },
  memberHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  memberImageContainer: { marginRight: 16 },
  memberImage: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontWeight: "600",
    marginBottom: 8
  },
  memberSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  summaryChip: {},
  summaryChipText: {
    fontSize: 12
  },
  noSelectionText: {
    fontStyle: "italic"
  },
  expandIcon: {
    justifyContent: "center",
    alignItems: "center"
  },
  serviceTimesContainer: {},
  divider: {
    height: 1
  },
  serviceTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  serviceTimeDetails: { flex: 1 },
  serviceTimeName: {
    fontWeight: "600",
    marginBottom: 2
  },
  selectedGroupText: {},
  selectGroupButton: {
    borderRadius: 8,
    minWidth: 100
  },
  selectGroupButtonText: {
    fontSize: 12,
    fontWeight: "600"
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  checkinButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  checkinButtonText: {
    fontWeight: "700",
    fontSize: 16
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    padding: 32,
    alignItems: "center"
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  }
});
