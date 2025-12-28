import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { type PlanItemInterface } from "@churchapps/helpers";
export type { PlanItemInterface };
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers/Constants";
import { SongDialog } from "./SongDialog";
import { AddOnDialog } from "./AddOnDialog";
import { ActionDialog } from "./ActionDialog";
import { LessonDialog } from "./LessonDialog";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Props {
  planItem: PlanItemInterface;
  isLast?: boolean;
  startTime?: number;
}

export const PlanItem = React.memo((props: Props) => {
  const [showSongDetails, setShowSongDetails] = React.useState(false);
  const [showAddOnDetails, setShowAddOnDetails] = React.useState(false);
  const [showActionDetails, setShowActionDetails] = React.useState(false);
  const [showLessonDetails, setShowLessonDetails] = React.useState(false);

  const itemContainerStyle = useMemo(() => [styles.itemContainer, props.isLast && { borderBottomWidth: 0 }], [props.isLast]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(props.planItem.seconds || 0), [props.planItem.seconds, formatTime]);

  const formattedStartTime = useMemo(() => formatTime(props.startTime || 0), [props.startTime, formatTime]);

  const getSectionDuration = useCallback((planItem: PlanItemInterface) => {
    let result = 0;
    planItem.children?.forEach((c) => {
      result += c.seconds || 0;
    });
    return result;
  }, []);

  const renderedChildren = useMemo(() => {
    if (!props.planItem.children?.length) return null;
    let cumulativeTime = props.startTime || 0;
    return props.planItem.children.map((child) => {
      const childStartTime = cumulativeTime;
      cumulativeTime += child.seconds || 0;
      return <PlanItem key={child.id} planItem={child} startTime={childStartTime} />;
    });
  }, [props.planItem.children, props.startTime]);

  const handleSongPress = useCallback(() => setShowSongDetails(true), []);
  const handleSongClose = useCallback(() => setShowSongDetails(false), []);
  const handleAddOnPress = useCallback(() => setShowAddOnDetails(true), []);
  const handleAddOnClose = useCallback(() => setShowAddOnDetails(false), []);
  const handleActionPress = useCallback(() => setShowActionDetails(true), []);
  const handleActionClose = useCallback(() => setShowActionDetails(false), []);
  const handleLessonPress = useCallback(() => setShowLessonDetails(true), []);
  const handleLessonClose = useCallback(() => setShowLessonDetails(false), []);

  const getHeaderRow = useCallback(() => {
    const sectionDuration = getSectionDuration(props.planItem);
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>{props.planItem.label}</Text>
          {sectionDuration > 0 && (
            <View style={styles.durationContainer}>
              <MaterialIcons name="schedule" size={14} color="#999" />
              <Text style={styles.durationText}>{formatTime(sectionDuration)}</Text>
            </View>
          )}
        </View>
        {renderedChildren}
      </View>
    );
  }, [props.planItem, renderedChildren, getSectionDuration, formatTime]);

  const getItemRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.startTimeText}>{formattedStartTime}</Text>
        <View style={styles.contentContainer}>
          {props.planItem.relatedId ? (
            <TouchableOpacity onPress={handleLessonPress}>
              <Text style={[styles.labelText, styles.linkText]}>{props.planItem.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.labelText}>{props.planItem.label}</Text>
          )}
          {props.planItem.description ? <Text style={styles.descriptionText}>{props.planItem.description}</Text> : null}
        </View>
        <View style={styles.durationContainer}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.durationText}>{formattedTime}</Text>
        </View>
        {showLessonDetails && props.planItem.relatedId && <LessonDialog sectionId={props.planItem.relatedId} sectionName={props.planItem.label} onClose={handleLessonClose} />}
      </View>
    ),
    [itemContainerStyle, formattedStartTime, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleLessonPress, handleLessonClose, showLessonDetails]
  );

  const getSongRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.startTimeText}>{formattedStartTime}</Text>
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={handleSongPress}>
            <Text style={[styles.labelText, styles.linkText]}>{props.planItem.label}</Text>
          </TouchableOpacity>
          {props.planItem.description ? <Text style={styles.descriptionText}>{props.planItem.description}</Text> : null}
        </View>
        <View style={styles.durationContainer}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.durationText}>{formattedTime}</Text>
        </View>
        {showSongDetails && <SongDialog arrangementKeyId={props.planItem.relatedId} onClose={handleSongClose} />}
      </View>
    ),
    [itemContainerStyle, formattedStartTime, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleSongPress, handleSongClose, showSongDetails]
  );

  const getActionRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.startTimeText}>{formattedStartTime}</Text>
        <View style={styles.contentContainer}>
          {props.planItem.relatedId ? (
            <TouchableOpacity onPress={handleActionPress}>
              <Text style={[styles.labelText, styles.linkText]}>{props.planItem.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.labelText}>{props.planItem.label}</Text>
          )}
          {props.planItem.description ? <Text style={styles.descriptionText}>{props.planItem.description}</Text> : null}
        </View>
        <View style={styles.durationContainer}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.durationText}>{formattedTime}</Text>
        </View>
        {showActionDetails && props.planItem.relatedId && <ActionDialog actionId={props.planItem.relatedId} actionName={props.planItem.label} onClose={handleActionClose} />}
      </View>
    ),
    [itemContainerStyle, formattedStartTime, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleActionPress, handleActionClose, showActionDetails]
  );

  const getAddOnRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.startTimeText}>{formattedStartTime}</Text>
        <View style={styles.contentContainer}>
          {props.planItem.relatedId ? (
            <TouchableOpacity onPress={handleAddOnPress}>
              <Text style={[styles.labelText, styles.linkText]}>{props.planItem.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.labelText}>{props.planItem.label}</Text>
          )}
          {props.planItem.description ? <Text style={styles.descriptionText}>{props.planItem.description}</Text> : null}
        </View>
        <View style={styles.durationContainer}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.durationText}>{formattedTime}</Text>
        </View>
        {showAddOnDetails && props.planItem.relatedId && <AddOnDialog addOnId={props.planItem.relatedId} addOnName={props.planItem.label} onClose={handleAddOnClose} />}
      </View>
    ),
    [itemContainerStyle, formattedStartTime, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleAddOnPress, handleAddOnClose, showAddOnDetails]
  );

  const getLessonSectionRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.startTimeText}>{formattedStartTime}</Text>
        <View style={styles.contentContainer}>
          {props.planItem.relatedId ? (
            <TouchableOpacity onPress={handleLessonPress}>
              <Text style={[styles.labelText, styles.linkText]}>{props.planItem.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.labelText}>{props.planItem.label}</Text>
          )}
          {props.planItem.description ? <Text style={styles.descriptionText}>{props.planItem.description}</Text> : null}
        </View>
        <View style={styles.durationContainer}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.durationText}>{formattedTime}</Text>
        </View>
        {showLessonDetails && props.planItem.relatedId && <LessonDialog sectionId={props.planItem.relatedId} sectionName={props.planItem.label} onClose={handleLessonClose} />}
      </View>
    ),
    [itemContainerStyle, formattedStartTime, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleLessonPress, handleLessonClose, showLessonDetails]
  );

  const planItemContent = useMemo(() => {
    switch (props.planItem.itemType) {
      case "header":
        return getHeaderRow();
      case "song":
      case "arrangementKey":
        return getSongRow();
      case "lessonAction":
        return getActionRow();
      case "lessonAddOn":
        return getAddOnRow();
      case "lessonSection":
        return getLessonSectionRow();
      case "item":
        return getItemRow();
      default:
        return null;
    }
  }, [props.planItem.itemType, getHeaderRow, getSongRow, getActionRow, getAddOnRow, getLessonSectionRow, getItemRow]);

  return <>{planItemContent}</>;
});

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: DimensionHelper.hp(1)
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DimensionHelper.wp(2),
    paddingVertical: DimensionHelper.hp(0.5),
    backgroundColor: "#f5f5f5",
    borderRadius: 4
  },
  headerLabel: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: "bold",
    color: Constants.Colors.Dark_Gray
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: DimensionHelper.hp(1),
    paddingHorizontal: DimensionHelper.wp(2),
    borderBottomWidth: 1,
    borderBottomColor: Constants.Colors.Dark_Gray,
    alignItems: "flex-start"
  },
  startTimeText: {
    width: DimensionHelper.wp(12),
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    textAlign: "left",
    marginRight: DimensionHelper.wp(2)
  },
  contentContainer: {
    flex: 1,
    minWidth: 0
  },
  labelText: {
    fontSize: DimensionHelper.wp(4),
    color: Constants.Colors.Dark_Gray
  },
  linkText: {
    color: Constants.Colors.app_color
  },
  descriptionText: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    marginTop: DimensionHelper.hp(0.5),
    opacity: 0.8,
    fontStyle: "italic"
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  durationText: {
    fontSize: DimensionHelper.wp(3.5),
    color: "#666",
    minWidth: DimensionHelper.wp(10),
    textAlign: "right"
  }
});
