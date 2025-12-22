import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { PlanInterface, ApiHelper } from "../../../src/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
import { useQuery } from "@tanstack/react-query";
import { PlanItem } from "./PlanItem";
import type { PlanItemInterface } from "./PlanItem";
import { LessonPreview } from "./LessonPreview";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  plan: PlanInterface;
}

interface LessonPreviewResponse {
  venueName: string;
  items: PlanItemInterface[];
}

export const ServiceOrder = (props: Props) => {
  const currentUserChurch = useCurrentUserChurch();

  const hasAssociatedLesson = props.plan?.contentType === "venue" && !!props.plan?.contentId;

  // Use react-query for plan items
  const { data: planItems = [] } = useQuery<PlanItemInterface[]>({
    queryKey: [`/planItems/plan/${props.plan?.id}`, "DoingApi"],
    enabled: !!props.plan?.id && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - plan items rarely change
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  // Use react-query for lesson preview items (only when no plan items exist)
  const { data: lessonPreviewData } = useQuery<LessonPreviewResponse>({
    queryKey: [`/venues/public/planItems/${props.plan?.contentId}`, "LessonsApi"],
    queryFn: async () => {
      const response = await ApiHelper.getAnonymous(`/venues/public/planItems/${props.plan?.contentId}`, "LessonsApi");
      return response;
    },
    enabled: hasAssociatedLesson && planItems.length === 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const showPreviewMode = hasAssociatedLesson && planItems.length === 0 && (lessonPreviewData?.items?.length ?? 0) > 0;

  const renderPlanItem = useCallback(({ item: planItem, index }: { item: PlanItemInterface; index: number }) => <PlanItem planItem={planItem} isLast={index === planItems.length - 1} />, [planItems.length]);

  const keyExtractor = useCallback((item: PlanItemInterface) => item.id?.toString() || "", []);

  const listData = useMemo(() => planItems || [], [planItems]);

  const renderContent = () => {
    if (showPreviewMode) {
      return <LessonPreview lessonItems={lessonPreviewData!.items} venueName={lessonPreviewData!.venueName} />;
    }
    if (listData.length > 0) {
      return <FlatList data={listData} renderItem={renderPlanItem} keyExtractor={keyExtractor} initialNumToRender={5} windowSize={5} removeClippedSubviews={true} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }} />;
    }
    return null;
  };

  return (
    <View style={[globalStyles.FlatlistViewStyle, styles.serviceOrderContainer]}>
      <View style={styles.contentContainer}>{renderContent()}</View>
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
