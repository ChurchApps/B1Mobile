import { ApiHelper, CheckinHelper, Constants, EnvironmentHelper, PersonInterface, ServiceTimeInterface } from "../../../src/helpers";
import { ErrorHelper } from "../../mobilehelper";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useAppTheme } from "../../../src/theme";
import { Button, Divider, List, Text } from "react-native-paper";
import { OptimizedImage } from "../OptimizedImage";

interface Props {
  onDone: () => void;
  showGroups: (member: PersonInterface, time: ServiceTimeInterface) => void;
}

export const CheckinHousehold = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <View style={{ marginBottom: spacing.sm, backgroundColor: theme.colors.surfaceVariant, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outlineVariant, overflow: "hidden" }}>
      <List.Item
        title={item.name.display}
        description={
          selected != item.id &&
          item.serviceTimes
            .map((item_time: any) => (item_time.selectedGroup ? `${item_time.name} - ${item_time.selectedGroup.name}` : null))
            .filter(Boolean)
            .join("\n")
        }
        left={props => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <List.Icon {...props} icon={selected == item.id ? "chevron-down" : "chevron-right"} />
            <OptimizedImage source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_member} style={{ width: 40, height: 40, borderRadius: 20 }} placeholder={Constants.Images.ic_member} />
          </View>
        )}
        onPress={() => setSelected(selected != item.id ? item.id : null)}
        style={{ backgroundColor: "transparent" }}
      />
      {selected == item.id &&
        item.serviceTimes &&
        item.serviceTimes.map((item_time: any) => (
          <View key={`service-time-${item_time.id}`} style={{ backgroundColor: theme.colors.background }}>
            <Divider />
            <List.Item
              title={item_time.name}
              description={item_time.selectedGroup ? item_time.selectedGroup.name : "NONE"}
              left={props => <List.Icon {...props} icon="clock-outline" />}
              right={() => (
                <Button mode="contained" onPress={() => (item_time.selection ? null : props.showGroups(item, item_time))} style={{ backgroundColor: item_time.selectedGroup ? Constants.Colors.button_green : Constants.Colors.button_bg }} disabled={item_time.selection}>
                  {item_time.selectedGroup ? item_time.selectedGroup.name : "NONE"}
                </Button>
              )}
            />
          </View>
        ))}
    </View>
  );

  return (
    <LoadingWrapper loading={loading}>
      <View>
        <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>
          Select Household Members
        </Text>
        <FlatList data={CheckinHelper.householdMembers} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={{ width: "100%" }} />
        <Button mode="contained" onPress={submitAttendance} style={{ marginTop: spacing.md }}>
          CHECKIN
        </Button>
      </View>
    </LoadingWrapper>
  );
};
