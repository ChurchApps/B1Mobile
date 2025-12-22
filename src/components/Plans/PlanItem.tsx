import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers/Constants";
import { SongDialog } from "./SongDialog";

export interface PlanItemInterface {
  id: string;
  label: string;
  description?: string;
  seconds: number;
  itemType: "header" | "song" | "arrangementKey" | "item" | "action";
  relatedId?: string;
  link?: string;
  children?: PlanItemInterface[];
}

interface Props {
  planItem: PlanItemInterface;
  isLast?: boolean;
}

export const PlanItem = React.memo((props: Props) => {
  const [showSongDetails, setShowSongDetails] = React.useState(false);

  const itemContainerStyle = useMemo(() => [styles.itemContainer, props.isLast && { borderBottomWidth: 0 }], [props.isLast]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(props.planItem.seconds / 60);
    const secs = props.planItem.seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }, [props.planItem.seconds]);

  const renderedChildren = useMemo(() => {
    if (!props.planItem.children?.length) return null;
    return props.planItem.children.map(child => <PlanItem key={child.id} planItem={child} />);
  }, [props.planItem.children]);

  const handleSongPress = useCallback(() => {
    setShowSongDetails(true);
  }, []);

  const handleSongClose = useCallback(() => {
    setShowSongDetails(false);
  }, []);

  const getHeaderRow = useCallback(() => <View style={styles.headerContainer}>{renderedChildren}</View>, [renderedChildren]);

  const getItemRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.labelText}>{props.planItem.label}</Text>
          <Text style={styles.descriptionText}>{props.planItem.description || " "}</Text>
        </View>
      </View>
    ),
    [itemContainerStyle, formattedTime, props.planItem.label, props.planItem.description]
  );

  const getSongRow = useCallback(
    () => (
      <View style={itemContainerStyle}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={handleSongPress}>
            <Text style={[styles.labelText, styles.songLink]}>{props.planItem.label}</Text>
          </TouchableOpacity>
          <Text style={styles.descriptionText}>{props.planItem.description || " "}</Text>
        </View>
        {showSongDetails && <SongDialog arrangementKeyId={props.planItem.relatedId} onClose={handleSongClose} />}
      </View>
    ),
    [itemContainerStyle, formattedTime, props.planItem.label, props.planItem.description, props.planItem.relatedId, handleSongPress, handleSongClose, showSongDetails]
  );

  const planItemContent = useMemo(() => {
    switch (props.planItem.itemType) {
      case "header":
        return getHeaderRow();
      case "song":
      case "arrangementKey":
        return getSongRow();
      case "item":
      case "action":
        return getItemRow();
      default:
        return null;
    }
  }, [props.planItem.itemType, getHeaderRow, getSongRow, getItemRow]);

  return <>{planItemContent}</>;
});

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: DimensionHelper.hp(1)
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: DimensionHelper.hp(1),
    paddingHorizontal: DimensionHelper.wp(2),
    borderBottomWidth: 1,
    borderBottomColor: Constants.Colors.Dark_Gray,
    alignItems: 'flex-start'
  },
  timeText: {
    width: DimensionHelper.wp(12),
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    textAlign: 'right',
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
  songLink: {
    color: Constants.Colors.app_color
  },
  descriptionText: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    marginTop: DimensionHelper.hp(0.5),
    opacity: 0.8
  },
  modalContainer: {
    // Add modal styles when implementing SongDialog
  }
});
