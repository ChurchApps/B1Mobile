import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { PlanInterface } from "../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers/Constants";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { PlanItem } from "./PlanItem";
import type { PlanItemInterface } from "./PlanItem";
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

  const renderPlanItem = useCallback(({ item: planItem, index }: { item: PlanItemInterface; index: number }) => <PlanItem planItem={planItem} isLast={index === planItems.length - 1} />, [planItems.length]);

  const keyExtractor = useCallback((item: PlanItemInterface) => item.id?.toString() || "", []);

  const listData = useMemo(() => planItems || [], [planItems]);

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
      <View style={styles.contentContainer}>{listData.length > 0 ? <FlatList data={listData} renderItem={renderPlanItem} keyExtractor={keyExtractor} initialNumToRender={5} windowSize={5} removeClippedSubviews={true} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }} /> : null}</View>
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
