import React, { useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { PlanHelper, type PlanItemInterface } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants, ExternalVenueRefInterface } from "../../../src/helpers";
import { ActionDialog } from "./ActionDialog";
import { LessonDialog } from "./LessonDialog";

interface Props {
  lessonItems: PlanItemInterface[];
  venueName: string;
  externalRef?: ExternalVenueRefInterface | null;
  associatedProviderId?: string;
  associatedVenueId?: string;
  ministryId?: string;
}

function isClickableAction(item: PlanItemInterface): boolean {
  const actionTypes = ["providerPresentation", "lessonAction", "action", "providerFile", "lessonAddOn", "addon", "file"];
  if (!actionTypes.includes(item.itemType || "")) return false;
  return !!(item.relatedId || (item.providerId && item.providerPath && item.providerContentPath));
}

function isClickableSection(item: PlanItemInterface): boolean {
  const sectionTypes = ["providerSection", "lessonSection", "section", "item"];
  if (!sectionTypes.includes(item.itemType || "")) return false;
  return !!(item.relatedId || (item.providerId && item.providerPath && item.providerContentPath));
}

export const LessonPreview = React.memo((props: Props) => {
  const [actionItem, setActionItem] = useState<PlanItemInterface | null>(null);
  const [sectionItem, setSectionItem] = useState<PlanItemInterface | null>(null);

  const handleActionClick = useCallback((item: PlanItemInterface) => {
    setActionItem(item);
  }, []);

  const handleSectionClick = useCallback((item: PlanItemInterface) => {
    setSectionItem(item);
  }, []);

  const renderPreviewItem = (item: PlanItemInterface, isChild: boolean = false) => {
    if (item.itemType === "header") {
      const sectionDuration = PlanHelper.getSectionDuration(item);
      return (
        <View key={item.id} style={styles.headerSection}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>{item.label}</Text>
            {sectionDuration > 0 && (
              <Text style={styles.headerTime}>{PlanHelper.formatTime(sectionDuration)}</Text>
            )}
          </View>
          {item.children?.map((child) => renderPreviewItem(child, true))}
        </View>
      );
    }

    const isAction = isClickableAction(item);
    const isSection = isClickableSection(item);
    const isClickable = isAction || isSection;

    const handleClick = () => {
      if (isAction) handleActionClick(item);
      else if (isSection) handleSectionClick(item);
    };

    return (
      <View key={item.id} style={[styles.itemRow, isChild && styles.childItem]}>
        {item.thumbnailUrl && (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        )}
        <View style={styles.itemContent}>
          {isClickable ? (
            <TouchableOpacity onPress={handleClick}>
              <Text style={styles.itemLabelLink}>{item.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.itemLabel}>{item.label}</Text>
          )}
          {item.description ? (
            <Text style={styles.itemDescription}>{item.description}</Text>
          ) : null}
        </View>
        {(item.seconds ?? 0) > 0 && (
          <Text style={styles.itemTime}>{PlanHelper.formatTime(item.seconds ?? 0)}</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.venueLabel}>Lesson: {props.venueName}</Text>
        <View style={styles.previewContent}>
          {props.lessonItems.map((item) => renderPreviewItem(item))}
        </View>
      </View>
      {actionItem && (
        <ActionDialog
          actionId={actionItem.relatedId || actionItem.providerContentPath || actionItem.id || ""}
          contentName={actionItem.label}
          externalRef={props.externalRef}
          onClose={() => setActionItem(null)}
          providerId={actionItem.providerId || props.associatedProviderId}
          downloadUrl={actionItem.link}
          providerPath={actionItem.providerPath}
          providerContentPath={actionItem.providerContentPath}
        />
      )}
      {sectionItem && (
        <LessonDialog
          sectionId={sectionItem.relatedId || sectionItem.providerContentPath || sectionItem.id || ""}
          sectionName={sectionItem.label}
          externalRef={props.externalRef}
          onClose={() => setSectionItem(null)}
          providerId={sectionItem.providerId}
          downloadUrl={sectionItem.link}
          providerPath={sectionItem.providerPath}
          providerContentPath={sectionItem.providerContentPath}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: DimensionHelper.wp(2) },
  venueLabel: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    marginBottom: DimensionHelper.hp(1),
    opacity: 0.7
  },
  previewContent: { opacity: 0.6 },
  headerSection: { marginBottom: DimensionHelper.hp(1) },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: DimensionHelper.wp(2),
    borderRadius: 4
  },
  headerLabel: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: "600",
    color: Constants.Colors.Dark_Gray
  },
  headerTime: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    opacity: 0.7
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: DimensionHelper.hp(1),
    paddingHorizontal: DimensionHelper.wp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  childItem: { paddingLeft: DimensionHelper.wp(4) },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: DimensionHelper.wp(2)
  },
  itemContent: { flex: 1 },
  itemLabel: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray
  },
  itemLabelLink: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.app_color,
    textDecorationLine: "underline"
  },
  itemDescription: {
    fontSize: DimensionHelper.wp(3),
    color: Constants.Colors.Dark_Gray,
    opacity: 0.7,
    fontStyle: "italic",
    marginTop: DimensionHelper.hp(0.3)
  },
  itemTime: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    opacity: 0.7,
    marginLeft: DimensionHelper.wp(2)
  }
});
