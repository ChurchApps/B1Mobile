import { useState, useCallback } from "react";
import { ApiHelper, CheckinHelper, PersonInterface } from "../helpers";
import { ArrayHelper } from "@churchapps/helpers";
import { useCurrentUserChurch } from "../stores/useUserStore";

export function useCheckinFlow(onDone: () => void) {
  const currentUserChurch = useCurrentUserChurch();
  const [selectServiceLoading, setSelectServiceLoading] = useState({ isLoading: false, campusId: "" });

  const createGroupTree = useCallback((groups: any) => {
    let category = "";
    const group_tree: any[] = [];
    const sortedGroups = groups.sort((a: any, b: any) => ((a.categoryName || "") > (b.categoryName || "") ? 1 : -1));
    sortedGroups?.forEach((group: any) => {
      if (group.categoryName !== category) group_tree.push({ key: group_tree.length, name: group.categoryName || "", items: [] });
      group_tree[group_tree.length - 1].items.push(group);
      category = group.categoryName || "";
    });
    return group_tree;
  }, []);

  const loadExistingAttendance = useCallback(async (serviceId: string) => {
    try {
      const peopleIdsString = CheckinHelper.peopleIds.join(",");
      const data = await ApiHelper.get("/visits/checkin?serviceId=" + serviceId + "&peopleIds=" + encodeURIComponent(peopleIdsString) + "&include=visitSessions", "AttendanceApi");
      CheckinHelper.setExistingAttendance(data);
    } catch (error) {
      console.error("Error loading existing attendance:", error);
    } finally {
      onDone();
    }
  }, [onDone]);

  const getMemberData = useCallback(async (serviceId: string) => {
    const personId = currentUserChurch?.person?.id;
    let householdId = currentUserChurch?.person?.householdId;

    if (!personId) {
      setSelectServiceLoading({ isLoading: false, campusId: "" });
      return;
    }

    try {
      if (!householdId) {
        const person: PersonInterface = await ApiHelper.get("/people/" + personId, "MembershipApi");
        householdId = person.householdId;
      }

      if (!householdId) householdId = personId;

      const [serviceTimes, groups] = await Promise.all([
        ApiHelper.get("/serviceTimes?serviceId=" + serviceId, "AttendanceApi"),
        ApiHelper.get("/groups", "MembershipApi")
      ]);

      CheckinHelper.serviceTimes = serviceTimes;
      CheckinHelper.serviceId = serviceId;

      CheckinHelper.householdMembers = await ApiHelper.get("/people/household/" + householdId, "MembershipApi");

      if (!CheckinHelper.householdMembers || CheckinHelper.householdMembers.length === 0) {
        const currentPerson = currentUserChurch?.person;
        if (currentPerson) CheckinHelper.householdMembers = [currentPerson];
      }

      CheckinHelper.groupTree = createGroupTree(groups);

      CheckinHelper.householdMembers?.forEach((member: any) => {
        member.serviceTimes = CheckinHelper.serviceTimes;
      });

      CheckinHelper.peopleIds = ArrayHelper.getIds(CheckinHelper.householdMembers, "id");

      await loadExistingAttendance(serviceId);
    } catch (error) {
      console.error("Error loading member data:", error);
      setSelectServiceLoading({ isLoading: false, campusId: "" });
    }
  }, [currentUserChurch, createGroupTree, loadExistingAttendance]);

  const selectService = useCallback(async (item: any) => {
    setSelectServiceLoading({ isLoading: true, campusId: item?.campusId });
    try {
      await getMemberData(item.id);
    } catch (error) {
      console.error("Error selecting service:", error);
      setSelectServiceLoading({ isLoading: false, campusId: "" });
    }
  }, [getMemberData]);

  return { selectService, selectServiceLoading };
}
