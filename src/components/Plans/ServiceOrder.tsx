import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PlanInterface } from "../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers/Constants";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { PlanItem } from ".";
import type { PlanItemInterface } from ".";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  plan: PlanInterface;
}

export const ServiceOrder = (props: Props) => {
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for plan items
  const { data: planItems = [] } = useQuery<PlanItemInterface[]>({
    queryKey: [`/planItems/plan/${props.plan?.id}`, "DoingApi"],
    enabled: !!props.plan?.id && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - plan items rarely change
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  return (
    <View style={[globalStyles.FlatlistViewStyle, { paddingTop: DimensionHelper.hp(2) }]}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Icons name="album" size={DimensionHelper.wp(5.5)} color={Constants.Colors.app_color} />
          <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>Order of Service</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            /* TODO: Implement print functionality */
          }}
          style={styles.printButton}>
          <Icons name="print" size={DimensionHelper.wp(5)} color={Constants.Colors.app_color} />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {planItems.map((pi, i) => (
          <PlanItem key={pi.id} planItem={pi} isLast={i === planItems.length - 1} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DimensionHelper.wp(3),
    paddingBottom: DimensionHelper.hp(1)
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  printButton: {
    padding: DimensionHelper.wp(2)
  },
  contentContainer: {
    paddingTop: DimensionHelper.hp(1)
  }
});
