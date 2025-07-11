import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Constants } from "../../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import { PersonHelper } from "../../../src/helpers";
import { Avatar, Chip } from "react-native-paper";

interface NotesInterface {
  item: any;
  message: MessageInterface;
  idx?: number;
  showReplyBox?: number | null;
  handleReply: (param: any) => void;
}

const Notes = ({ item, message, idx, showReplyBox, handleReply }: NotesInterface) => {
  const displayDuration = dayjs(message?.timeSent).fromNow();
  const isEdited = message.timeUpdated && message.timeUpdated !== message.timeSent;
  const replyCount = item?.postCount ? item.postCount - 1 : 0;

  return (
    <View style={styles.messageContainer}>
      {/* Main Message */}
      <View style={styles.messageContent}>
        <Avatar.Image size={40} source={message?.person?.photo && message.person ? { uri: PersonHelper.getPhotoUrl(message.person) } : Constants.Images.ic_member} style={styles.avatar} />

        <View style={styles.messageBody}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName}>{message?.displayName}</Text>
            <Text style={styles.timestamp}>{displayDuration}</Text>
            {isEdited && (
              <Chip icon="pencil" textStyle={styles.editedChip} style={styles.editedChipContainer}>
                edited
              </Chip>
            )}
          </View>

          <Text style={styles.messageText}>{message?.content}</Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.replyButton, showReplyBox === idx && styles.replyButtonActive]} onPress={() => (showReplyBox === idx ? handleReply(null) : handleReply(idx))}>
              <Text style={[styles.replyText, showReplyBox === idx && styles.replyTextActive]}>{showReplyBox === idx ? "Cancel" : "Reply"}</Text>
            </TouchableOpacity>

            {replyCount > 0 && (
              <Chip icon="chat-outline" textStyle={styles.replyCountText} style={styles.replyCountChip}>
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </Chip>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 2
  },
  messageContent: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  avatar: {
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  messageBody: {
    flex: 1,
    paddingTop: 2
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D47A1"
  },
  timestamp: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500"
  },
  editedChipContainer: {
    backgroundColor: "rgba(158, 158, 158, 0.1)",
    height: 20
  },
  editedChip: {
    fontSize: 10,
    color: "#9E9E9E",
    lineHeight: 12
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#3c3c3c",
    marginBottom: 8
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4
  },
  replyButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#F6F6F8"
  },
  replyButtonActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#0D47A1"
  },
  replyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9E9E9E"
  },
  replyTextActive: {
    color: "#0D47A1"
  },
  replyCountChip: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    height: 24
  },
  replyCountText: {
    fontSize: 11,
    color: "#0D47A1",
    fontWeight: "600"
  }
});

export default Notes;
