import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { type PlanItemInterface, PlanHelper } from "@churchapps/helpers";
export type { PlanItemInterface };
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { SongDialog } from "./SongDialog";
import { ActionDialog } from "./ActionDialog";
import { LessonDialog } from "./LessonDialog";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors } from "../../theme";

interface Props {
  planItem: PlanItemInterface;
  isLast?: boolean;
  startTime?: number;
  associatedProviderId?: string;
  associatedVenueId?: string;
  ministryId?: string;
}

export const PlanItem = React.memo((props: Props) => {
  const colors = useThemeColors();
  const [showSongDetails, setShowSongDetails] = React.useState(false);
  const [showActionDetails, setShowActionDetails] = React.useState(false);
  const [showLessonDetails, setShowLessonDetails] = React.useState(false);

  const pi = props.planItem;
  const hasProviderFields = pi.providerId && pi.providerPath && pi.providerContentPath;

  const itemContainerStyle = useMemo(() => [styles.itemContainer, props.isLast && { borderBottomWidth: 0 }], [props.isLast]);
  const formattedTime = useMemo(() => PlanHelper.formatTime(pi.seconds || 0), [pi.seconds]);
  const formattedStartTime = useMemo(() => PlanHelper.formatTime(props.startTime || 0), [props.startTime]);

  const renderedChildren = useMemo(() => {
    if (!pi.children?.length) return null;
    let cumulativeTime = props.startTime || 0;
    return pi.children.map((child) => {
      const childStartTime = cumulativeTime;
      cumulativeTime += child.seconds || 0;
      return (
        <PlanItem
          key={child.id}
          planItem={child}
          startTime={childStartTime}
          associatedProviderId={props.associatedProviderId}
          associatedVenueId={props.associatedVenueId}
          ministryId={props.ministryId}
        />
      );
    });
  }, [pi.children, props.startTime, props.associatedProviderId, props.associatedVenueId, props.ministryId]);

  const handleSongPress = useCallback(() => setShowSongDetails(true), []);
  const handleSongClose = useCallback(() => setShowSongDetails(false), []);
  const handleActionPress = useCallback(() => setShowActionDetails(true), []);
  const handleActionClose = useCallback(() => setShowActionDetails(false), []);
  const handleLessonPress = useCallback(() => setShowLessonDetails(true), []);
  const handleLessonClose = useCallback(() => setShowLessonDetails(false), []);

  const getHeaderRow = useCallback(() => {
    const sectionDuration = PlanHelper.getSectionDuration(pi);
    return (
      <View style={styles.headerContainer}>
        <View style={[styles.headerRow, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.headerLabel, { color: colors.text }]}>{pi.label}</Text>
          {sectionDuration > 0 && (
            <View style={styles.durationContainer}>
              <MaterialIcons name="schedule" size={14} color={colors.textHint} />
              <Text style={[styles.durationText, { color: colors.textMuted }]}>{PlanHelper.formatTime(sectionDuration)}</Text>
            </View>
          )}
        </View>
        {renderedChildren}
      </View>
    );
  }, [pi, renderedChildren, colors]);

  const getGenericRow = useCallback((onPress?: () => void, dialogElement?: React.ReactNode) => (
    <View style={[itemContainerStyle, { borderBottomColor: colors.border }]}>
      <Text style={[styles.startTimeText, { color: colors.text }]}>{formattedStartTime}</Text>
      <View style={styles.contentContainer}>
        {onPress ? (
          <TouchableOpacity onPress={onPress}>
            <Text style={[styles.labelText, styles.linkText, { color: colors.primary }]}>{pi.label}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.labelText, { color: colors.text }]}>{pi.label}</Text>
        )}
        {pi.description ? <Text style={[styles.descriptionText, { color: colors.text }]}>{pi.description}</Text> : null}
      </View>
      <View style={styles.durationContainer}>
        <MaterialIcons name="schedule" size={14} color={colors.textHint} />
        <Text style={[styles.durationText, { color: colors.textMuted }]}>{formattedTime}</Text>
      </View>
      {dialogElement}
    </View>
  ), [itemContainerStyle, formattedStartTime, formattedTime, pi.label, pi.description, colors]);

  const planItemContent = useMemo(() => {
    switch (pi.itemType) {
      case "header": return getHeaderRow();
      case "song":
      case "arrangementKey":
        return getGenericRow(
          pi.relatedId ? handleSongPress : undefined,
          showSongDetails && <SongDialog arrangementKeyId={pi.relatedId} onClose={handleSongClose} />
        );
      // Action types (new provider + legacy)
      case "providerPresentation":
      case "lessonAction":
      case "action":
      // File/add-on types (new provider + legacy)
      // falls through
      case "providerFile":
      case "lessonAddOn":
      case "addon":
      case "file":
        return getGenericRow(
          (pi.relatedId || hasProviderFields) ? handleActionPress : undefined,
          showActionDetails && (
            <ActionDialog
              actionId={pi.relatedId || pi.providerContentPath || pi.id}
              contentName={pi.label}
              onClose={handleActionClose}
              providerId={pi.providerId || props.associatedProviderId}
              downloadUrl={pi.link}
              providerPath={pi.providerPath}
              providerContentPath={pi.providerContentPath}
            />
          )
        );
      // Section types (new provider + legacy)
      case "providerSection":
      case "lessonSection":
      case "section":
        return getGenericRow(
          (pi.relatedId || hasProviderFields) ? handleLessonPress : undefined,
          showLessonDetails && (
            <LessonDialog
              sectionId={pi.relatedId || pi.providerContentPath || pi.id}
              sectionName={pi.label}
              onClose={handleLessonClose}
              providerId={pi.providerId}
              downloadUrl={pi.link}
              providerPath={pi.providerPath}
              providerContentPath={pi.providerContentPath}
            />
          )
        );
      case "item":
      default:
        return getGenericRow(
          pi.relatedId ? handleLessonPress : undefined,
          showLessonDetails && pi.relatedId && (
            <LessonDialog
              sectionId={pi.relatedId}
              sectionName={pi.label}
              onClose={handleLessonClose}
              providerId={pi.providerId}
              providerPath={pi.providerPath}
              providerContentPath={pi.providerContentPath}
            />
          )
        );
    }
  }, [
    pi.itemType, getHeaderRow, getGenericRow, handleSongPress, handleSongClose, handleActionPress, handleActionClose, handleLessonPress, handleLessonClose, showSongDetails, showActionDetails, showLessonDetails, hasProviderFields, props.associatedProviderId
  ]);

  return <>{planItemContent}</>;
});

const styles = StyleSheet.create({
  headerContainer: { paddingVertical: DimensionHelper.hp(1) },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DimensionHelper.wp(2),
    paddingVertical: DimensionHelper.hp(0.5),
    borderRadius: 4
  },
  headerLabel: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: "bold"
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: DimensionHelper.hp(1),
    paddingHorizontal: DimensionHelper.wp(2),
    borderBottomWidth: 1,
    alignItems: "flex-start"
  },
  startTimeText: {
    width: DimensionHelper.wp(12),
    fontSize: DimensionHelper.wp(3.5),
    textAlign: "left",
    marginRight: DimensionHelper.wp(2)
  },
  contentContainer: {
    flex: 1,
    minWidth: 0
  },
  labelText: { fontSize: DimensionHelper.wp(4) },
  linkText: {},
  descriptionText: {
    fontSize: DimensionHelper.wp(3.5),
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
    minWidth: DimensionHelper.wp(10),
    textAlign: "right"
  }
});
