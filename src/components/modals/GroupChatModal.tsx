import React, { useEffect, useState } from "react";
import { Modal, View, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import GroupChatInner from "./GroupChatInner";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { ApiHelper, ConversationInterface } from "../../helpers";
import { useThemeColors } from "../../theme";

interface GroupChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  groupId: string;
  groupName: string;
  initialTab?: ChatTab;
}

type ChatTab = "discussions" | "announcements";

const GroupChatModal: React.FC<GroupChatModalProps> = ({ visible, onDismiss, groupId, groupName, initialTab }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<ChatTab>(initialTab ?? "discussions");
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

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleDismiss}>
      <StatusBar barStyle={"dark-content"} />
      <Appbar.Header>
        <Appbar.BackAction onPress={handleDismiss} />
        <Appbar.Content title={groupName} />
      </Appbar.Header>

      {showTabBar && (
        <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "discussions" && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab("discussions")}
          >
            <Text variant="labelLarge" style={[styles.tabText, { color: colors.disabled }, activeTab === "discussions" && { color: colors.primary, fontWeight: "700" }]}>
              {t("groups.discussions") || "Discussions"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "announcements" && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab("announcements")}
          >
            <Text variant="labelLarge" style={[styles.tabText, { color: colors.disabled }, activeTab === "announcements" && { color: colors.primary, fontWeight: "700" }]}>
              {t("groups.announcements") || "Announcements"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "discussions" ? (
        <GroupChatInner key={`group-${groupId}-discussions`} groupId={groupId} groupName={groupName} visible={visible} contentType="group" canPost={true} />
      ) : (
        <GroupChatInner key={`group-${groupId}-announcements`} groupId={groupId} groupName={groupName} visible={visible} contentType="groupAnnouncement" canPost={isLeader} />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  tabText: { fontWeight: "500" }
});

export default GroupChatModal;
