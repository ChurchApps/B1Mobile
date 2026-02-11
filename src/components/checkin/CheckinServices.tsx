import { ApiHelper, CheckinHelper, PersonInterface, UserHelper } from "../../../src/helpers";
import { ArrayHelper } from "@churchapps/helpers";
import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useAppTheme } from "../../../src/theme";
import { Card, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

interface Props {
  onDone: () => void;
  handleBack: () => void;
}

export const CheckinServices = (props: Props) => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const currentUserChurch = useCurrentUserChurch();
  const screenWidth = Dimensions.get("window").width;
  const [selectServiceLoading, setSelectServiceLoading] = useState({
    isLoading: false,
    campusId: ""
  });

  // Use react-query for services
  const {
    data: serviceList = [],
    isLoading: servicesLoading,
    error: servicesError
  } = useQuery({
    queryKey: ["/services", "AttendanceApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - services don't change frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("ServiceScreen");
  }, []);

  const ServiceSelection = async (item: any) => {
    setSelectServiceLoading({
      isLoading: true,
      campusId: item?.campusId
    });
    try {
      await getMemberData(item.id);
    } catch (error) {
      console.error("Error selecting service:", error);
      setSelectServiceLoading({
        isLoading: false,
        campusId: ""
      });
    }
  };

  const getMemberData = async (serviceId: any) => {
    const personId = currentUserChurch?.person?.id;
    let householdId = currentUserChurch?.person?.householdId;

    if (personId) {
      try {
        // If no householdId in the user object, fetch the person to get it
        if (!householdId) {
          const person: PersonInterface = await ApiHelper.get("/people/" + personId, "MembershipApi");
          householdId = person.householdId;
        }

        if (!householdId) {
          householdId = personId;
        }

        // Step 1: Load service times and groups in parallel (like Chums)
        const [serviceTimes, groups] = await Promise.all([ApiHelper.get("/serviceTimes?serviceId=" + serviceId, "AttendanceApi"), ApiHelper.get("/groups", "MembershipApi")]);

        CheckinHelper.serviceTimes = serviceTimes;
        CheckinHelper.serviceId = serviceId;

        // Step 2: Load household members using the householdId
        CheckinHelper.householdMembers = await ApiHelper.get("/people/household/" + householdId, "MembershipApi");

        // If still no household members, create array with just the current person
        if (!CheckinHelper.householdMembers || CheckinHelper.householdMembers.length === 0) {
          const currentPerson = currentUserChurch?.person;
          if (currentPerson) {
            CheckinHelper.householdMembers = [currentPerson];
          }
        }

        // Step 3: Create group tree
        const group_tree = createGroupTree(groups);
        CheckinHelper.groupTree = group_tree;

        // Step 4: Assign service times to each household member
        CheckinHelper.householdMembers?.forEach((member: any) => {
          member.serviceTimes = CheckinHelper.serviceTimes;
        });

        // Step 5: Get people IDs for existing visits check
        CheckinHelper.peopleIds = ArrayHelper.getIds(CheckinHelper.householdMembers, "id");

        // Step 6: Load existing attendance
        await loadExistingAttendance(serviceId);
      } catch (error) {
        console.error("Error loading member data:", error);
        setLoading(false);
        setSelectServiceLoading({
          isLoading: false,
          campusId: ""
        });
      }
    } else {
      setLoading(false);
      setSelectServiceLoading({
        isLoading: false,
        campusId: ""
      });
      // Could implement anonymous check-in flow here
    }
  };

  // Remove this function as it's now integrated into getMemberData

  const loadExistingAttendance = async (serviceId: string) => {
    try {
      const peopleIdsString = CheckinHelper.peopleIds.join(",");
      const data = await ApiHelper.get("/visits/checkin?serviceId=" + serviceId + "&peopleIds=" + encodeURIComponent(peopleIdsString) + "&include=visitSessions", "AttendanceApi");
      CheckinHelper.setExistingAttendance(data);
    } catch (error) {
      console.error("Error loading existing attendance:", error);
    } finally {
      setLoading(false);
      // Now that all data is loaded, navigate to the next screen
      props.onDone();
    }
  };

  const createGroupTree = (groups: any) => {
    let category = "";
    const group_tree: any[] = [];

    const sortedGroups = groups.sort((a: any, b: any) => ((a.categoryName || "") > (b.categoryName || "") ? 1 : -1));

    sortedGroups?.forEach((group: any) => {
      if (group.categoryName !== category) group_tree.push({ key: group_tree.length, name: group.categoryName || "", items: [] });
      group_tree[group_tree.length - 1].items.push(group);
      category = group.categoryName || "";
    });
    return group_tree;
  };

  // Remove this function as it's now integrated into getMemberData

  const renderServiceItem = (item: any) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => ServiceSelection(item)} activeOpacity={0.7}>
      <View style={styles.serviceContent}>
        <View style={styles.serviceIconContainer}>
          <MaterialIcons name="church" size={28} color="#0D47A1" />
        </View>
        <View style={styles.serviceInfo}>
          {item?.name && (
            <Text variant="titleLarge" style={styles.serviceName}>
              {item.name}
            </Text>
          )}

          {item.campus?.name && (
            <Text variant="bodyMedium" style={styles.campusName}>
              {item.campus?.name}
            </Text>
          )}
        </View>
        <View style={styles.serviceArrow}>{selectServiceLoading.isLoading && selectServiceLoading.campusId === item.campusId ? <ActivityIndicator /> : <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />}</View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LoadingWrapper loading={loading}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconHeaderContainer}>
            <MaterialIcons name="event" size={48} color="#0D47A1" />
          </View>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            {t("checkin.selectService")}
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            {t("checkin.chooseService")}
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.contentSection}>
          {servicesLoading || (serviceList?.length === 0 && !servicesError) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D47A1" />
              <Text variant="bodyLarge" style={styles.loadingText}>
                {t("checkin.loadingServices")}
              </Text>
            </View>
          ) : serviceList.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <MaterialIcons name="event-busy" size={64} color="#9E9E9E" />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  {t("checkin.noServicesAvailable")}
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  {t("checkin.noServicesMessage")}
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList data={serviceList} renderItem={({ item }) => renderServiceItem(item)} keyExtractor={(item: any) => item.id} style={styles.servicesList} contentContainerStyle={styles.servicesContent} showsVerticalScrollIndicator={false} />
          )}
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
  servicesList: { flex: 1 },
  servicesContent: { paddingBottom: 24 },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 72
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 4
  },
  campusName: {
    color: "#0D47A1",
    fontWeight: "500"
  },
  serviceArrow: {
    justifyContent: "center",
    alignItems: "center"
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48
  },
  loadingText: {
    color: "#9E9E9E",
    marginTop: 16
  }
});
