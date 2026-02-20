import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { type PlanInterface, type PlanItemInterface, type VenuePlanItemsResponseInterface, LessonsContentProvider, ApiHelper } from "@churchapps/helpers";
import { getProvider, type InstructionItem, type IProvider, type Instructions } from "@churchapps/content-providers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { globalStyles } from "../../../src/helpers/GlobalStyles";
import { useQuery } from "@tanstack/react-query";
import { PlanItem } from "./PlanItem";
import { LessonPreview } from "./LessonPreview";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  plan: PlanInterface;
}

interface PlanItemWithStartTime extends PlanItemInterface {
  startTime: number;
}

function findThumbnailRecursive(item: InstructionItem): string | undefined {
  if (item.thumbnail) return item.thumbnail;
  if (item.children) {
    for (const child of item.children) {
      const found = findThumbnailRecursive(child);
      if (found) return found;
    }
  }
  return undefined;
}

function instructionToPlanItem(item: InstructionItem, providerId?: string, providerPath?: string, pathIndices: number[] = []): PlanItemInterface {
  let itemType = item.itemType || "item";
  if (itemType === "section") itemType = "providerSection";
  else if (itemType === "action") itemType = "providerPresentation";
  else if (itemType === "file") itemType = "providerFile";

  const contentPath = pathIndices.length > 0 ? pathIndices.join(".") : undefined;
  const thumbnail = findThumbnailRecursive(item);

  return {
    itemType,
    relatedId: item.relatedId,
    label: item.label || "",
    description: item.description,
    seconds: item.seconds ?? 0,
    providerId,
    providerPath,
    providerContentPath: contentPath,
    thumbnailUrl: thumbnail,
    children: item.children?.map((child, index) => instructionToPlanItem(child, providerId, providerPath, [...pathIndices, index]))
  };
}

export const ServiceOrder = (props: Props) => {
  const currentUserChurch = useCurrentUserChurch();

  const lessonsProvider = useMemo(() => new LessonsContentProvider(), []);
  const hasAssociatedLesson = lessonsProvider.hasAssociatedLesson(props.plan);
  const externalRef = lessonsProvider.getExternalRef(props.plan);

  const provider: IProvider | null = useMemo(() => {
    if (props.plan?.providerId) return getProvider(props.plan.providerId);
    return null;
  }, [props.plan?.providerId]);

  const hasAssociatedContent = !!provider || hasAssociatedLesson;

  const fetchPreviewItems = useCallback(async (): Promise<VenuePlanItemsResponseInterface> => {
    if (provider && props.plan?.providerPlanId) {
      let instructions: Instructions | null = null;

      if (!provider.requiresAuth && provider.capabilities.instructions && provider.getInstructions) {
        instructions = await provider.getInstructions(props.plan.providerPlanId);
      }

      if (!instructions) {
        try {
          instructions = await ApiHelper.post(
            "/providerProxy/getInstructions",
            { providerId: props.plan.providerId, path: props.plan.providerPlanId },
            "DoingApi"
          );
        } catch { /* fall through */ }
      }

      if (instructions) {
        const items: PlanItemInterface[] = instructions.items.map((item, index) =>
          instructionToPlanItem(item, props.plan.providerId, props.plan.providerPlanId, [index])
        );
        return { items, venueName: props.plan.providerPlanName || instructions.name || "" };
      }
    }

    if (hasAssociatedLesson) {
      return await lessonsProvider.fetchVenuePlanItems(props.plan);
    }

    return { items: [] };
  }, [provider, props.plan, hasAssociatedLesson, lessonsProvider]);

  const { data: planItems = [] } = useQuery<PlanItemInterface[]>({
    queryKey: [`/planItems/plan/${props.plan?.id}`, "DoingApi"],
    enabled: !!props.plan?.id && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const { data: lessonPreviewData } = useQuery<VenuePlanItemsResponseInterface>({
    queryKey: ["lessonPreview", props.plan?.id, props.plan?.contentType, props.plan?.contentId, props.plan?.providerId, props.plan?.providerPlanId],
    queryFn: fetchPreviewItems,
    enabled: hasAssociatedContent && planItems.length === 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const showPreviewMode = hasAssociatedContent && planItems.length === 0 && (lessonPreviewData?.items?.length ?? 0) > 0;

  const planItemsWithStartTime = useMemo(() => {
    let cumulativeTime = 0;
    return planItems.map((pi) => {
      const startTime = cumulativeTime;
      cumulativeTime += pi.seconds || 0;
      return { ...pi, startTime };
    });
  }, [planItems]);

  const renderPlanItem = useCallback(({ item: planItem, index }: { item: PlanItemWithStartTime; index: number }) => (
    <PlanItem
      planItem={planItem}
      isLast={index === planItems.length - 1}
      startTime={planItem.startTime}
      associatedProviderId={props.plan?.providerId}
      associatedVenueId={props.plan?.providerPlanId}
      ministryId={props.plan?.ministryId}
    />
  ), [planItems.length, props.plan?.providerId, props.plan?.providerPlanId, props.plan?.ministryId]);

  const keyExtractor = useCallback((item: PlanItemWithStartTime) => item.id?.toString() || "", []);

  const renderContent = () => {
    if (showPreviewMode && lessonPreviewData?.items && lessonPreviewData?.venueName) {
      return (
        <LessonPreview
          lessonItems={lessonPreviewData.items}
          venueName={lessonPreviewData.venueName}
          externalRef={externalRef}
          associatedProviderId={props.plan?.providerId}
          associatedVenueId={props.plan?.providerPlanId}
          ministryId={props.plan?.ministryId}
        />
      );
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
