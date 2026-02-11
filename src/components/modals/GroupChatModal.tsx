import React, { useState } from "react";
import { Modal, View, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import GroupChatInner from "./GroupChatInner";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { ApiHelper, ConversationInterface } from "../../helpers";

interface GroupChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  groupId: string;
  groupName: string;
}

type ChatTab = "discussions" | "announcements";

const GroupChatModal: React.FC<GroupChatModalProps> = ({ visible, onDismiss, groupId, groupName }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ChatTab>("discussions");
  const currentUserChurch = useCurrentUserChurch();

  const isLeader = currentUserChurch?.groups?.some(
    (g: any) => g.id === groupId && g.leader
  ) ?? false;

  const { data: announcementCheck } = useQuery<ConversationInterface[]>({
    queryKey: [`/conversations/messages/groupAnnouncement/${groupId}`, 1, 1, "MessagingApi"],
    enabled: !!groupId && !!currentUserChurch?.jwt && visible && !isLeader,
    queryFn: async () => {
      return ApiHelper.get(
        `/conversations/messages/groupAnnouncement/${groupId}?page=1&limit=1`,
        "MessagingApi"
      );
    }
  });

  const hasAnnouncements = announcementCheck?.some(c => c.messages && c.messages.length > 0) ?? false;
  const showTabBar = isLeader || hasAnnouncements;

  const handleDismiss = () => {
    StatusBar.setBarStyle("light-content");
    onDismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleDismiss}>
      <StatusBar barStyle={"dark-content"} />
      <Appbar.Header>
        <Appbar.BackAction onPress={handleDismiss} />
        <Appbar.Content title={groupName} />
      </Appbar.Header>

      {showTabBar && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "discussions" && styles.activeTab]}
            onPress={() => setActiveTab("discussions")}
          >
            <Text variant="labelLarge" style={[styles.tabText, activeTab === "discussions" && styles.activeTabText]}>
              {t("groups.discussions") || "Discussions"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "announcements" && styles.activeTab]}
            onPress={() => setActiveTab("announcements")}
          >
            <Text variant="labelLarge" style={[styles.tabText, activeTab === "announcements" && styles.activeTabText]}>
              {t("groups.announcements") || "Announcements"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "discussions" ? (
        <GroupChatInner groupId={groupId} groupName={groupName} visible={visible} contentType="group" canPost={true} />
      ) : (
        <GroupChatInner groupId={groupId} groupName={groupName} visible={visible} contentType="groupAnnouncement" canPost={isLeader} />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: { borderBottomColor: "#0D47A1" },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
  }
});

export default GroupChatModal;
