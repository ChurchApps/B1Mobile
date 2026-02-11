import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { type PlanInterface, type PlanItemInterface, type VenuePlanItemsResponseInterface, LessonsContentProvider } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
import { useQuery } from "@tanstack/react-query";
import { PlanItem } from "./PlanItem";
import { LessonPreview } from "./LessonPreview";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  plan: PlanInterface;
}

// Extended interface for planItems with startTime
interface PlanItemWithStartTime extends PlanItemInterface {
  startTime: number;
}

export const ServiceOrder = (props: Props) => {
  const currentUserChurch = useCurrentUserChurch();

  // Use LessonsContentProvider from helpers
  const lessonsProvider = useMemo(() => new LessonsContentProvider(), []);
  const hasAssociatedLesson = lessonsProvider.hasAssociatedLesson(props.plan);
  const externalRef = lessonsProvider.getExternalRef(props.plan);

  const fetchVenuePlanItems = useCallback(async () => {
    return await lessonsProvider.fetchVenuePlanItems(props.plan);
  }, [lessonsProvider, props.plan]);

  // Use react-query for plan items
  const { data: planItems = [] } = useQuery<PlanItemInterface[]>({
    queryKey: [`/planItems/plan/${props.plan?.id}`, "DoingApi"],
    enabled: !!props.plan?.id && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - plan items rarely change
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  // Use react-query for lesson preview items (only when no plan items exist)
  const { data: lessonPreviewData } = useQuery<VenuePlanItemsResponseInterface>({
    queryKey: ["lessonPreview", props.plan?.id, props.plan?.contentType, props.plan?.contentId],
    queryFn: fetchVenuePlanItems,
    enabled: hasAssociatedLesson && planItems.length === 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const showPreviewMode = hasAssociatedLesson && planItems.length === 0 && (lessonPreviewData?.items?.length ?? 0) > 0;

  const planItemsWithStartTime = useMemo(() => {
    let cumulativeTime = 0;
    return planItems.map((pi) => {
      const startTime = cumulativeTime;
      cumulativeTime += pi.seconds || 0;
      return { ...pi, startTime };
    });
  }, [planItems]);

  const renderPlanItem = useCallback(({ item: planItem, index }: { item: PlanItemWithStartTime; index: number }) => <PlanItem planItem={planItem} isLast={index === planItems.length - 1} startTime={planItem.startTime} />, [planItems.length]);

  const keyExtractor = useCallback((item: PlanItemWithStartTime) => item.id?.toString() || "", []);

  const renderContent = () => {
    if (showPreviewMode && lessonPreviewData?.items && lessonPreviewData?.venueName) {
      return <LessonPreview lessonItems={lessonPreviewData.items} venueName={lessonPreviewData.venueName} externalRef={externalRef} />;
    }
    if (planItemsWithStartTime.length > 0) {
      return <FlatList data={planItemsWithStartTime} renderItem={renderPlanItem} keyExtractor={keyExtractor} initialNumToRender={5} windowSize={5} removeClippedSubviews={true} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }} />;
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
    width: "100%",
    paddingTop: DimensionHelper.hp(2),
    marginHorizontal: 0,
    alignSelf: "stretch"
  },
  contentContainer: {
    paddingTop: DimensionHelper.hp(1),
    paddingHorizontal: 0
  }
});
