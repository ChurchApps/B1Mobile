import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import moment from "moment";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Card, IconButton, Text as PaperText, useTheme } from 'react-native-paper';
// Icon from react-native-vector-icons is replaced by IconButton
// Constants is removed, globalStyles usage will be minimized/replaced
import { MessageInterface } from "@churchapps/helpers";
import { PersonHelper, Constants } from "@/src/helpers"; // Constants needed for Images.ic_member

interface NotesInterface {
  message: MessageInterface;
  showEditNote: (noteId: any) => void;
}

const Note = ({ message, showEditNote }: NotesInterface) => {
  const theme = useTheme();
  const displayDuration = moment(message?.timeSent).fromNow();

  const styles = StyleSheet.create({
    card: {
      marginVertical: theme.spacing?.xs || 4, // Add some vertical spacing
      marginHorizontal: theme.spacing?.sm || 8, // Add some horizontal spacing
      // Original width was DimensionHelper.wp(70), this might need to be set by parent container
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start', // Align items to the start of the row for avatar and text
    },
    avatar: {
      marginRight: theme.spacing?.sm || 8,
      // Original size was DimensionHelper.wp(12)
    },
    contentView: {
      flex: 1, // Take remaining space
      flexDirection: 'row', // For text content and edit button
      justifyContent: 'space-between', // Push edit button to the end
      alignItems: 'flex-start',
    },
    textContent: {
      flex: 1, // Allow text to wrap and take available width before edit icon
      marginRight: theme.spacing?.xs || 4, // Space before edit icon
    },
    name: {
      // fontWeight: 'bold', // Handled by PaperText variant if chosen
      marginBottom: theme.spacing?.xs / 2 || 2,
    },
    messageContent: {
      // Default text style
    },
    editButton: {
      // IconButton has its own margins, adjust if needed or use style prop on IconButton
      margin: 0, // Reset default margin if too large
      right: -theme.spacing?.sm || -8, // Negative margin to pull closer to edge if Card has padding
      top: -theme.spacing?.sm || -8,
    },
    timestamp: {
      marginTop: theme.spacing?.xs / 2 || 2,
      marginLeft: (theme.spacing?.sm || 8) * 2 + (DimensionHelper.wp(12) * 0), // Align with text, considering avatar size. This needs review.
      // Original styling for timestamp was complex (left: 72, top: -4).
      // This should be simplified with normal layout flow if possible.
      // fontSize: 11, // Use PaperText variant like 'caption'
      color: theme.colors.onSurfaceVariant,
      paddingLeft: (theme.spacing?.sm || 8) + (DimensionHelper.wp(12)), // Align with text content
    },
  });

  const avatarSource = message?.person?.photo
    ? { uri: PersonHelper.getPhotoUrl(message.person) }
    : Constants.Images.ic_member; // Assuming ic_member is a local require or a known URI

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        {avatarSource ? (
            <Avatar.Image size={DimensionHelper.wp(12)} source={avatarSource} style={styles.avatar} />
        ) : (
            <Avatar.Icon size={DimensionHelper.wp(12)} icon="account" style={styles.avatar} /> // Fallback icon
        )}
        <View style={styles.contentView}>
          <View style={styles.textContent}>
            <PaperText variant="labelLarge" style={styles.name}>{message?.displayName}</PaperText>
            <PaperText variant="bodyMedium" style={styles.messageContent}>{message?.content}</PaperText>
          </View>
          <IconButton
            icon="pencil" // MaterialCommunityIcons name for edit
            size={DimensionHelper.wp(5)}
            iconColor={theme.colors.primary}
            onPress={() => showEditNote(message.id)}
            style={styles.editButton}
          />
        </View>
      </View>
      <PaperText variant="caption" style={styles.timestamp}>
        {displayDuration}
      </PaperText>
    </Card>
  );
};

export default Note;
