import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import moment from "moment";
import React from "react";
import { View, StyleSheet } from "react-native"; // Image, Text removed
import { Constants, globalStyles } from "@/src/helpers"; // globalStyles will be partially replaced
import { MessageInterface } from "@churchapps/helpers";
import { PersonHelper } from "@/src/helpers/PersonHelper";
import { Avatar, List, Text as PaperText, Button as PaperButton, useTheme, Caption } from 'react-native-paper';

interface NotesInterface {
  item: any;
  message: MessageInterface;
  idx?: number;
  showReplyBox?: number | null;
  handleReply: (param: any) => void;
}

const Notes = ({
  item,
  message,
  idx,
  showReplyBox,
  handleReply,
}: NotesInterface) => {
  const theme = useTheme();
  const displayDuration = moment(message?.timeSent).fromNow();
  const isEdited = message.timeUpdated && message.timeUpdated !== message.timeSent;

  const styles = StyleSheet.create({
    listItem: {
      paddingVertical: DimensionHelper.wp(2),
      // Using List.Item's internal padding, adjust if necessary
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    nameText: {
      fontWeight: 'bold',
      marginRight: DimensionHelper.wp(1.5),
      color: theme.colors.onSurface,
    },
    durationText: {
      fontSize: DimensionHelper.wp(3),
      color: theme.colors.onSurfaceVariant,
    },
    editedText: {
      fontSize: DimensionHelper.wp(3),
      fontStyle: 'italic',
      color: theme.colors.onSurfaceVariant,
      marginLeft: DimensionHelper.wp(1),
    },
    messageContent: {
      fontSize: DimensionHelper.wp(3.8),
      color: theme.colors.onSurface,
      marginTop: DimensionHelper.wp(0.5),
    },
    replyButton: {
      // PaperButton mode="text" handles its own styling mostly
      // Adjust margin if needed, e.g., marginLeft to push it right
      // marginLeft: 'auto', // Pushes button to the right if parent is row and flex
      alignSelf: 'flex-start', // Keep it aligned with text if in a column
      marginTop: DimensionHelper.wp(1),
    },
    replyButtonLabel: {
      fontSize: DimensionHelper.wp(3.5),
      // color: theme.colors.primary, // Default for Button mode="text"
    },
    avatar: {
      // Avatar size is controlled by size prop
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: DimensionHelper.wp(1),
    }
  });

  const renderAvatar = () => (
    <Avatar.Image
      size={DimensionHelper.wp(12)}
      source={
        message?.person?.photo
          ? { uri: PersonHelper.getPhotoUrl(message.person) }
          : Constants.Images.ic_member // Ensure this is a valid local image source for Avatar
      }
      style={styles.avatar}
    />
  );

  const renderTitle = () => (
    <View style={styles.titleContainer}>
      <PaperText style={styles.nameText}>{message?.displayName}</PaperText>
    </View>
  );

  const renderDescription = () => (
    <>
      <PaperText style={styles.messageContent}>{message?.content}</PaperText>
      <View style={styles.metaRow}>
        <Caption style={styles.durationText}>{displayDuration}</Caption>
        {isEdited && <Caption style={styles.editedText}> • (edited)</Caption>}
      </View>
      {item.postCount > 0 && ( // Show reply button only if there are posts/replies
        <PaperButton
          mode="text"
          onPress={() => showReplyBox === idx ? handleReply(null) : handleReply(idx)}
          style={styles.replyButton}
          labelStyle={styles.replyButtonLabel}
          compact // Makes button smaller
        >
          {`${item.postCount - 1 > 0 ? (item.postCount - 1) + ' ' : ''}REPLY${item.postCount - 1 > 1 ? 'IES' : ''}`}
        </PaperButton>
      )}
    </>
  );


  return (
    <List.Item
      title={renderTitle}
      description={renderDescription}
      left={renderAvatar}
      style={styles.listItem}
      titleNumberOfLines={2} // Adjust as needed
      descriptionNumberOfLines={10} // Adjust as needed for message content and button
    />
  );
};

export default Notes;
