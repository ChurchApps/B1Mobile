import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { PlanInterface } from "../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
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
    <View style={[globalStyles.FlatlistViewStyle, styles.serviceOrderContainer]}>
      <View style={styles.contentContainer}>{listData.length > 0 ? <FlatList data={listData} renderItem={renderPlanItem} keyExtractor={keyExtractor} initialNumToRender={5} windowSize={5} removeClippedSubviews={true} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }} /> : null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  serviceOrderContainer: {
    width: '100%',
    paddingTop: DimensionHelper.hp(2),
    marginHorizontal: 0,
    alignSelf: 'stretch'
  },
  contentContainer: {
    paddingTop: DimensionHelper.hp(1),
    paddingHorizontal: 0
  }
});
