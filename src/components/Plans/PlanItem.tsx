import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { Constants } from '@/src/helpers/Constants';
import { globalStyles } from '@/src/helpers/GlobalStyles';
import { SongDialog } from './SongDialog';

export interface PlanItemInterface {
  id: string;
  label: string;
  description?: string;
  seconds: number;
  itemType: 'header' | 'song' | 'arrangementKey' | 'item';
  relatedId?: string;
  children?: PlanItemInterface[];
}

interface Props {
  planItem: PlanItemInterface;
  isLast?: boolean;
}

export const PlanItem = (props: Props) => {
  const [showSongDetails, setShowSongDetails] = React.useState(false);

  const itemContainerStyle = [
    styles.itemContainer,
    props.isLast && { borderBottomWidth: 0 }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getChildren = () => {
    if (!props.planItem.children?.length) return null;
    return props.planItem.children.map((child) => (
      <PlanItem key={child.id} planItem={child} />
    ));
  };

  const getHeaderRow = () => (
    <View style={styles.headerContainer}>
      {getChildren()}
    </View>
  );

  const getItemRow = () => (
    <View style={itemContainerStyle}>
      <Text style={styles.timeText}>{formatTime(props.planItem.seconds)}</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.labelText}>{props.planItem.label}</Text>
        <Text style={styles.descriptionText}>{props.planItem.description || ' '}</Text>
      </View>
    </View>
  );

  const getSongRow = () => (
    <View style={itemContainerStyle}>
      <Text style={styles.timeText}>{formatTime(props.planItem.seconds)}</Text>
      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={() => setShowSongDetails(true)}>
          <Text style={[styles.labelText, styles.songLink]}>{props.planItem.label}</Text>
        </TouchableOpacity>
        <Text style={styles.descriptionText}>{props.planItem.description || ' '}</Text>
      </View>
      {showSongDetails && (
        <SongDialog arrangementKeyId={props.planItem.relatedId} onClose={() => setShowSongDetails(false)} />
      )}
    </View>
  );

  const getPlanItem = () => {
    switch (props.planItem.itemType) {
      case 'header':
        return getHeaderRow();
      case 'song':
      case 'arrangementKey':
        return getSongRow();
      case 'item':
        return getItemRow();
      default:
        return null;
    }
  };

  return (
    <>
      {getPlanItem()}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: DimensionHelper.hp(1),
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: DimensionHelper.hp(1),
    paddingHorizontal: DimensionHelper.wp(3),
    borderBottomWidth: 1,
    borderBottomColor: Constants.Colors.Dark_Gray,
  },
  timeText: {
    width: DimensionHelper.wp(15),
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
  },
  contentContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: DimensionHelper.wp(4),
    color: Constants.Colors.Dark_Gray,
  },
  songLink: {
    color: Constants.Colors.app_color,
  },
  descriptionText: {
    fontSize: DimensionHelper.wp(3.5),
    color: Constants.Colors.Dark_Gray,
    marginTop: DimensionHelper.hp(0.5),
    opacity: 0.8,
  },
  modalContainer: {
    // Add modal styles when implementing SongDialog
  },
}); 