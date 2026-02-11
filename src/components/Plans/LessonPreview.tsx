import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PlanHelper } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants, ExternalVenueRefInterface } from "../../../src/helpers";
import type { PlanItemInterface } from "./PlanItem";
import { ActionDialog } from "./ActionDialog";
import { LessonDialog } from "./LessonDialog";
import { AddOnDialog } from "./AddOnDialog";

interface Props {
  lessonItems: PlanItemInterface[];
  venueName: string;
  externalRef?: ExternalVenueRefInterface | null;
}

export const LessonPreview = React.memo((props: Props) => {
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionName, setActionName] = useState<string>("");
  const [lessonSectionId, setLessonSectionId] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string>("");
  const [addOnId, setAddOnId] = useState<string | null>(null);
  const [addOnName, setAddOnName] = useState<string>("");

  const handleActionClick = useCallback((item: PlanItemInterface) => {
    if (item.relatedId) {
      setActionId(item.relatedId);
      setActionName(item.label || "");
    }
  }, []);

  const handleSectionClick = useCallback((item: PlanItemInterface) => {
    if (item.relatedId) {
      setLessonSectionId(item.relatedId);
      setSectionName(item.label || "");
    }
  }, []);

  const handleAddOnClick = useCallback((item: PlanItemInterface) => {
    if (item.relatedId) {
      setAddOnId(item.relatedId);
      setAddOnName(item.label || "");
    }
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

    const isAction = item.itemType === "lessonAction" && item.relatedId;
    const isLessonSection = item.itemType === "item" && item.relatedId;
    const isAddOn = item.itemType === "lessonAddOn" && item.relatedId;
    const isClickable = isAction || isLessonSection || isAddOn;

    const handleClick = () => {
      if (isAction) handleActionClick(item);
      else if (isAddOn) handleAddOnClick(item);
      else handleSectionClick(item);
    };

    return (
      <View key={item.id} style={[styles.itemRow, isChild && styles.childItem]}>
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
      {actionId && <ActionDialog actionId={actionId} actionName={actionName} externalRef={props.externalRef} onClose={() => setActionId(null)} />}
      {lessonSectionId && <LessonDialog sectionId={lessonSectionId} sectionName={sectionName} externalRef={props.externalRef} onClose={() => setLessonSectionId(null)} />}
      {addOnId && <AddOnDialog addOnId={addOnId} addOnName={addOnName} externalRef={props.externalRef} onClose={() => setAddOnId(null)} />}
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
