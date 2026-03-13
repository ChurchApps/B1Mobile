import dayjs from "../../helpers/dayjsConfig";
import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { MessageInterface } from "@churchapps/helpers";
import { Chip } from "react-native-paper";
import { Avatar } from "../common/Avatar";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface NotesInterface {
  item: any;
  message: MessageInterface;
  idx?: number;
  showReplyBox?: number | null;
  handleReply: (param: any) => void;
}

const Notes = ({ item, message, idx, showReplyBox, handleReply }: NotesInterface) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const displayDuration = dayjs(message?.timeSent).fromNow();
  const isEdited = message.timeUpdated && message.timeUpdated !== message.timeSent;
  const replyCount = item?.postCount ? item.postCount - 1 : 0;

  return (
    <View style={styles.messageContainer}>
      {/* Main Message */}
      <View style={styles.messageContent}>
        <Avatar size={40} photoUrl={message?.person?.photo} firstName={message?.person?.name?.first} lastName={message?.person?.name?.last} style={[styles.avatar, { shadowColor: colors.shadowBlack }]} />

        <View style={styles.messageBody}>
          <View style={styles.messageHeader}>
            <Text style={[styles.userName, { color: colors.primary }]}>{message?.person?.name?.display || message?.displayName || t("common.unknown")}</Text>
            <Text style={[styles.timestamp, { color: colors.disabled }]}>{displayDuration}</Text>
            {isEdited && (
              <Chip icon="pencil" textStyle={[styles.editedChip, { color: colors.disabled }]} style={[styles.editedChipContainer, { backgroundColor: `${colors.disabled}1A` }]}>
                {t("messages.edited")}
              </Chip>
            )}
          </View>

          <Text style={[styles.messageText, { color: colors.text }]}>{message?.content}</Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.replyButton, { backgroundColor: colors.iconBackground }, showReplyBox === idx && { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary }]} onPress={() => (showReplyBox === idx ? handleReply(null) : handleReply(idx))}>
              <Text style={[styles.replyText, { color: colors.disabled }, showReplyBox === idx && { color: colors.primary }]}>{showReplyBox === idx ? t("common.cancel") : t("messages.reply")}</Text>
            </TouchableOpacity>

            {replyCount > 0 && (
              <Chip icon="chat-outline" textStyle={[styles.replyCountText, { color: colors.primary }]} style={[styles.replyCountChip, { backgroundColor: `${colors.primary}1A` }]}>
                {t("messages.replyCount", { count: replyCount })}
              </Chip>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: { marginBottom: 2 },
  messageContent: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  avatar: {
    marginRight: 12,
    elevation: 2,
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
    fontWeight: "700"
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "500"
  },
  editedChipContainer: { height: 20 },
  editedChip: {
    fontSize: 10,
    lineHeight: 12
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
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
    borderRadius: 16
  },
  replyButtonActive: {},
  replyText: {
    fontSize: 12,
    fontWeight: "600"
  },
  replyTextActive: {},
  replyCountChip: { height: 24 },
  replyCountText: {
    fontSize: 11,
    fontWeight: "600"
  }
});

export default Notes;
