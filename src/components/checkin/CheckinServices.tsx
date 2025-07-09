import { ApiHelper, CheckinHelper, PersonInterface, UserHelper } from "../../../src/helpers";
import { ArrayHelper, ErrorHelper } from "../../mobilehelper";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useAppTheme } from "../../../src/theme";
import { List, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  onDone: () => void;
}

export const CheckinServices = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for services
  const { data: serviceList = [] } = useQuery({
    queryKey: ["/services", "AttendanceApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - services don't change frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("ServiceScreen");
  }, []);

  const ServiceSelection = (item: any) => {
    setLoading(true);
    getMemberData(item.id);
  };

  const getMemberData = async (serviceId: any) => {
    const personId = UserHelper.currentUserChurch?.person?.id;
    if (personId) {
      try {
        const person: PersonInterface = await ApiHelper.get("/people/" + personId, "MembershipApi");
        CheckinHelper.householdMembers = await ApiHelper.get("/people/household/" + person.householdId, "MembershipApi");
        CheckinHelper.serviceTimes = await ApiHelper.get("/serviceTimes?serviceId=" + serviceId, "AttendanceApi");
        await createHouseholdTree(serviceId);
        loadExistingAttendance(serviceId);
      } catch (error) {
        console.error("Error loading member data:", error);
        setLoading(false);
      }
    }
  };

  const createHouseholdTree = async (serviceId: any) => {
    CheckinHelper.householdMembers?.forEach((member: any) => {
      member.serviceTimes = CheckinHelper.serviceTimes;
    });
    try {
      await getGroupListData(serviceId);
    } catch (error: any) {
      console.log("SET MEMBER LIST ERROR", error);
      ErrorHelper.logError("create-household", error);
    }
  };

  const loadExistingAttendance = async (serviceId: string) => {
    setLoading(true);
    const data = await ApiHelper.get("/visits/checkin?serviceId=" + serviceId + "&peopleIds=" + CheckinHelper.peopleIds + "&include=visitSessions", "AttendanceApi");
    setLoading(false);
    CheckinHelper.setExistingAttendance(data);
  };

  const createGroupTree = (groups: any) => {
    let category = "";
    let group_tree: any[] = [];

    const sortedGroups = groups.sort((a: any, b: any) => ((a.categoryName || "") > (b.categoryName || "") ? 1 : -1));

    sortedGroups?.forEach((group: any) => {
      if (group.categoryName !== category) group_tree.push({ key: group_tree.length, name: group.categoryName || "", items: [] });
      group_tree[group_tree.length - 1].items.push(group);
      category = group.categoryName || "";
    });
    return group_tree;
  };

  const getGroupListData = async (serviceId: any) => {
    const data = await ApiHelper.get("/groups", "MembershipApi");
    setLoading(false);
    try {
      const group_tree = createGroupTree(data);
      CheckinHelper.groupTree = group_tree;
      CheckinHelper.serviceId = serviceId;
      CheckinHelper.peopleIds = ArrayHelper.getIds(CheckinHelper.householdMembers, "id");
      props.onDone();
    } catch (error: any) {
      console.log("SET MEMBER LIST ERROR", error);
      ErrorHelper.logError("get-group-list", error);
    }
  };

  const renderGroupItem = (item: any) => <List.Item title={`${item.campus.name} - ${item.name}`} onPress={() => ServiceSelection(item)} style={{ backgroundColor: theme.colors.surface, marginBottom: spacing.xs }} titleStyle={{ color: theme.colors.onSurface }} left={props => <List.Icon {...props} icon="church" />} />;

  return (
    <LoadingWrapper loading={loading}>
      <View>
        <Text variant="headlineMedium" style={{ marginBottom: spacing.md }}>
          Select a Service
        </Text>
        <FlatList data={serviceList} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.id} style={{ width: "100%" }} />
      </View>
    </LoadingWrapper>
  );
};
