import { ApiHelper, CheckinHelper, PersonInterface, UserHelper } from "@/src/helpers";
import { ArrayHelper, ErrorHelper } from "@churchapps/mobilehelper";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { useAppTheme } from "@/src/theme";
import { List, Text } from "react-native-paper";

interface Props {
  onDone: () => void;
}

export const CheckinServices = (props: Props) => {
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);

  useEffect(() => {
    getServiceData();
    UserHelper.addOpenScreenEvent("ServiceScreen");
  }, []);

  const getServiceData = async () => {
    setLoading(true);
    ApiHelper.get("/services", "AttendanceApi").then(data => {
      setLoading(false);
      setServiceList(data);
    });
  };

  const ServiceSelection = (item: any) => {
    setLoading(true);
    getMemberData(item.id);
  };

  const getMemberData = async (serviceId: any) => {
    const personId = UserHelper.currentUserChurch?.person?.id;
    if (personId) {
      const person: PersonInterface = await ApiHelper.get("/people/" + personId, "MembershipApi");
      CheckinHelper.householdMembers = await ApiHelper.get("/people/household/" + person.householdId, "MembershipApi");
      CheckinHelper.serviceTimes = await ApiHelper.get("/serviceTimes?serviceId=" + serviceId, "AttendanceApi");
      await createHouseholdTree(serviceId);
      loadExistingAttendance(serviceId);
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

  const renderGroupItem = (item: any) => (
    <List.Item
      title={`${item.campus.name} - ${item.name}`}
      onPress={() => ServiceSelection(item)}
      style={{ backgroundColor: theme.colors.surface, marginBottom: spacing.xs }}
      titleStyle={{ color: theme.colors.onSurface }}
      left={props => <List.Icon {...props} icon="church" />}
    />
  );

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
