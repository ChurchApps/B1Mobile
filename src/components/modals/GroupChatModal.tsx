import React, { useState, useEffect, useRef } from "react";
import { Modal, View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, RefreshControl, StatusBar, TouchableOpacity, Pressable } from "react-native";
import { Appbar, Text, IconButton, Avatar as PaperAvatar, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { ApiHelper, ConversationInterface, ArrayHelper } from "../../helpers";
import { MessageInterface } from "@churchapps/helpers";
import { useQuery } from "@tanstack/react-query";
import { useCurrentChurch, useCurrentUserChurch } from "../../stores/useUserStore";
import { Avatar } from "../common/Avatar";
import dayjs from "../../helpers/dayjsConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput as PaperTextInput } from "react-native-paper";
const { width: screenWidth } = Dimensions.get("window");

interface GroupChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  groupId: string;
  groupName: string;
}

interface ChatMessage extends MessageInterface {
  id: string;
  person?: any;
  reactions?: any[];
  isOwn?: boolean;
}

const PAGE_SIZE = 20;

const GroupChatModal: React.FC<GroupChatModalProps> = ({ visible, onDismiss, groupId, groupName }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const isSelectionMode = selectedMessages.length > 0;
  const flatListRef = useRef<FlatList>(null);
  const currentUserChurch = useCurrentUserChurch();
  const insets = useSafeAreaInsets();
  const currentChurch = useCurrentChurch();
  const inputRef = useRef<React.ComponentRef<typeof PaperTextInput>>(null);

  const { data: rawConversations = [], refetch } = useQuery<ConversationInterface[]>({
    queryKey: [`/conversations/messages/group/${groupId}`, page, PAGE_SIZE, "MessagingApi"],
    enabled: !!groupId && !!currentUserChurch?.jwt && visible,
    placeholderData: [],
    staleTime: 0,
    gcTime: 3 * 60 * 1000,
    queryFn: async () => {
      const res: ConversationInterface[] = await ApiHelper.get(`/conversations/messages/group/${groupId}?page=${page}&limit=${PAGE_SIZE}`, "MessagingApi");
      return res;
    }
  });

  useEffect(() => {
    if (visible) {
      loadMessages(1, true);
    }
  }, [visible]);

  const loadMessages = async (pageNumber = 1, reset = false) => {
    if (!groupId || loadingMore) return;

    try {
      setLoadingMore(true);
      const res: ConversationInterface[] = await ApiHelper.get(`/conversations/messages/group/${groupId}?page=${pageNumber}&limit=${PAGE_SIZE}`, "MessagingApi");

      if (!res || res.length === 0) {
        setHasMore(false);
        return;
      }

      const newMessages: ChatMessage[] = [];
      const peopleIds: string[] = [];

      res.forEach(conv => {
        conv.messages?.forEach((msg: ChatMessage) => {
          newMessages.push({
            ...msg,
            isOwn: msg.personId === currentUserChurch?.person?.id
          });
          if (msg.personId && !peopleIds.includes(msg.personId)) peopleIds.push(msg.personId);
        });
      });

      if (peopleIds.length > 0) {
        try {
          const people = await ApiHelper.get("/people/basic?ids=" + peopleIds.join(","), "MembershipApi");
          newMessages.forEach(msg => {
            msg.person = people ? ArrayHelper.getOne(people, "id", msg.personId) : null;
          });
        } catch (err) {
          console.warn("Failed to load people data:", err);
        }
      }

      newMessages.sort((a, b) => new Date(b.timeSent).getTime() - new Date(a.timeSent).getTime());

      setMessages(prev => (reset ? newMessages : [...prev, ...newMessages]));
      setPage(pageNumber);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && messages?.length > 0) loadMessages(page + 1);
  };

  const deleteMessage = async (obj: ChatMessage) => {
    try {
      setMessages(prev =>
        prev.filter(item => item.id !== obj.id)
      );
      setEditingMessage(null);
      setNewMessage("");
      await ApiHelper.delete(`/messages/${currentChurch?.id}/${editingMessage?.id}`, "MessagingApi");
    } catch (err) {
    } finally {
    }
  };

  const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const trimmedMessage = newMessage.trim();
    const tempId = "temp-" + Date.now();
  let optimisticMsg: ChatMessage;

  if (editingMessage) {
    // Update existing message
    optimisticMsg = { ...editingMessage, content: trimmedMessage };
    setMessages(prev =>
      prev.map(item => (item.id === editingMessage.id ? optimisticMsg : item))
    );
    setEditingMessage(null);
    setNewMessage("");
  } else {
    // Create new message
    optimisticMsg = {
      id: tempId,
      conversationId: rawConversations[0]?.id || "tempConv",
      content: trimmedMessage,
      personId: currentUserChurch?.person?.id!,
      displayName: currentUserChurch?.person?.name?.display || "",
      timeSent: new Date().toISOString(),
      isOwn: true,
      person: currentUserChurch?.person,
    };

    setMessages(prev => [optimisticMsg, ...prev]);
    setNewMessage("");
  }

  // Scroll to top
  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  try {
    // Ensure conversation exists
    let conversationId = rawConversations[0]?.id;
    if (!conversationId) {
      const conv = {
        groupId,
        allowAnonymousPosts: false,
        contentType: "group",
        contentId: groupId,
        title: `${groupName} Chat`,
        visibility: "hidden",
      };
      const result: ConversationInterface[] = await ApiHelper.post(
        "/conversations",
        [conv],
        "MessagingApi"
      );
      conversationId = result[0].id;
    }

    const payload = {
      conversationId,
      content: optimisticMsg.content,
      personId: optimisticMsg.personId,
      id: editingMessage ? editingMessage.id : "",
    };

    const savedMsg = await ApiHelper.post("/messages", [payload], "MessagingApi");

    // Replace temporary message with saved message
    setMessages(prev =>
      prev.map(m => (m.id === tempId ? { ...m, ...savedMsg[0] } : m))
    );
  } catch (err) {
    console.error("Failed to send message:", err);

    // Remove temporary message on failure
    if (!editingMessage) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  }
};


  const canEditMessage = (msg?: ChatMessage) => {
    if (!msg) return false;
    return dayjs().diff(dayjs(msg.timeSent), "minute") < 15;
  };

  const toggleSelectMessage = (msgId: string) => {
    setSelectedMessages(prev => (prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]));
  };

  const handleLongPress = (msg: ChatMessage) => {
    if (!isSelectionMode) {
      setSelectedMessages([msg.id]);
    } else if (!selectedMessages.includes(msg.id)) {
      setSelectedMessages(prev => [...prev, msg.id]);
    }
    setActionModalVisible(true);
  };

  const handlePress = (msg: ChatMessage) => {
    if (isSelectionMode) {
      toggleSelectMessage(msg.id);
    } else {
    }
  };

  const closeModal = () => {
    setActionModalVisible(false);
    setSelectedMessages([]);
  };

  const formatRelative = (time: string | Date) => {
    const diffMinutes = dayjs().diff(dayjs(time), "minute");

    if (diffMinutes === 0) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  const scrollToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.05
      });
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isNextFromSame = index < messages.length - 1 && messages[index + 1]?.personId === item.personId;
    const isPrevFromSame = index > 0 && messages[index - 1]?.personId === item.personId;
    const showAvatar = !isNextFromSame;
    const showName = !isPrevFromSame && !item.isOwn;
    const isSelected = selectedMessages.includes(item.id);
    const isBeingEdited = editingMessage?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          item.isOwn && styles.ownMessageContainer,
          isSelected && { backgroundColor: "#E3F2FD", borderRadius: 10 },
          editingMessage && !isBeingEdited && { opacity: 0.5 } // gray out other messages
        ]}
        onLongPress={() => handleLongPress(item)}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}>
        {!item.isOwn && (
          <View style={styles.avatarContainer}>
            {showAvatar ? <Avatar size={32} photoUrl={item.person?.photo} firstName={item.person?.name?.first} lastName={item.person?.name?.last} /> : <View style={styles.avatarSpacer} />}
          </View>
        )}

        <View style={[styles.messageBubble, item.isOwn ? styles.ownBubble : styles.otherBubble]}>
          {showName && <Text style={styles.senderName}>{item.person?.name?.display || item.displayName}</Text>}
          <View style={styles.messageContentContainer}>
            <Text style={[styles.messageText, item.isOwn && styles.ownMessageText]}>
              {item.content} {item.edited && <Text style={{ fontSize: 10, color: "#888" }}>(edited)</Text>}
            </Text>
            <Text style={[styles.timestamp, item.isOwn && styles.ownTimestamp]}>{formatRelative(item.timeSent)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <>
      {!loadingMore && (
        <View style={styles.emptyState}>
          <PaperAvatar.Icon size={64} icon="chat-outline" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>{t("groups.startConversation")}</Text>
          <Text style={styles.emptySubtitle}>{t("groups.beFirstToShare")}</Text>
        </View>
      )}
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onDismiss}>
      <StatusBar barStyle={"dark-content"} />
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            setMessages([]);
            setNewMessage("");
            setPage(1);
            setLoadingMore(false);
            setHasMore(true);
            setSelectedMessages([]);
            setActionModalVisible(false);
            StatusBar.setBarStyle("light-content");
            onDismiss();
          }}
        />
        <Appbar.Content title={groupName} />
      </Appbar.Header>

      <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        {loadingMore && <ActivityIndicator size="small" color="#175ec1" />}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted={messages?.length > 0}
          onEndReachedThreshold={0.1}
          onEndReached={handleLoadMore}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmptyState}
          // refreshControl={<RefreshControl refreshing={loadingMore} tintColor="#175ec1" />}
        />

        <Surface style={[styles.inputBar, { paddingBottom: insets.bottom || 8 }]}>
          {editingMessage && (
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                setEditingMessage(null);
                setNewMessage("");
              }}
            />
          )}
          <PaperTextInput
            mode="outlined"
            ref={inputRef}
            placeholder={t("groups.sendMessage")}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            style={styles.textInput}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            style={[styles.sendButton, newMessage.trim() && styles.sendButtonActive]}
            iconColor={newMessage.trim() ? "#FFFFFF" : "#9E9E9E"}
          />
        </Surface>
      </KeyboardAvoidingView>

      <Modal transparent visible={actionModalVisible} animationType="slide" onRequestClose={closeModal}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} onPress={closeModal}>
          <View
            style={{
              position: "absolute",
              bottom: 100,
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              marginHorizontal: 40,
              gap: 14
            }}>
            {selectedMessages.length === 1 && canEditMessage(messages.find(m => m.id === selectedMessages[0])!) && (
              <TouchableOpacity
                style={{ paddingHorizontal: 12 }}
                onPress={() => {
                  const msgToEdit = messages.find(m => m.id === selectedMessages[0]);
                  if (msgToEdit) {
                    setEditingMessage(msgToEdit);
                    setNewMessage(msgToEdit.content);
                    closeModal();
                    setTimeout(() => {
                      inputRef.current?.focus();
                      scrollToMessage(msgToEdit.id);
                    }, 100);
                  }
                }}>
                <Text style={{ fontSize: 16 }}>{t("common.edit")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ paddingHorizontal: 12 }}
              onPress={() => {
                const msgToEdit = messages.find(m => m.id === selectedMessages[0]);
                if (msgToEdit) {
                  setEditingMessage(msgToEdit);
                  closeModal();
                  deleteMessage(msgToEdit)
                }
              }}>
              <Text style={{ fontSize: 16, color: "red" }}>{t("common.delete")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  modalContainer: {
    flex: 1,
    margin: 0
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3c3c3c"
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9E9E9E"
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 2,
    alignItems: "flex-end"
  },
  messageContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  ownMessageContainer: {
    flexDirection: "row-reverse"
  },
  avatarContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 8
  },
  avatarSpacer: {
    width: 32,
    height: 32
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginHorizontal: 4
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4
  },
  ownBubble: {
    backgroundColor: "#0D47A1",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#3c3c3c"
  },
  ownMessageText: {
    color: "#FFFFFF"
  },
  timestamp: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4
    // alignSelf: "flex-end"
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)"
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16
  },
  dateText: {
    fontSize: 12,
    color: "#9E9E9E",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden"
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3c3c3c",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "transparent",
    paddingBottom: 2
  },
  inputContent: {
    fontSize: 15,
    textAlignVertical: "center"
  },
  inputOutline: {
    borderColor: "#E9ECEF",
    borderWidth: 1,
    borderRadius: 20
  },
  sendButton: {
    margin: 0,
    marginLeft: 8,
    backgroundColor: "#F6F6F8"
  },
  sendButtonActive: {
    backgroundColor: "#0D47A1"
  },
  editBar: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  editBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1
  },
  editingText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 12
  },
  cancelEdit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D47A1"
  }
});

export default GroupChatModal;
