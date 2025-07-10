import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions } from "react-native";
import { Portal, Modal, Appbar, Text, TextInput, IconButton, Avatar, Surface } from "react-native-paper";
import { ApiHelper, ConversationInterface, ArrayHelper } from "../../helpers";
import { MessageInterface } from "@churchapps/helpers";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import { PersonHelper, Constants } from "../../helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { width: screenWidth } = Dimensions.get("window");

interface GroupChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  groupId: string;
  groupName: string;
}

interface ChatMessage extends MessageInterface {
  person?: any;
  reactions?: any[];
  isOwn?: boolean;
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({ visible, onDismiss, groupId, groupName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for conversations
  const { data: rawConversations = [], refetch: refetchConversations } = useQuery<ConversationInterface[]>({
    queryKey: [`/conversations/group/${groupId}`, "MessagingApi"],
    enabled: !!groupId && !!currentUserChurch?.jwt && visible,
    placeholderData: [],
    staleTime: 0,
    gcTime: 3 * 60 * 1000
  });

  useEffect(() => {
    if (rawConversations.length > 0 && visible) {
      loadMessages();
    }
  }, [rawConversations, visible]);

  const loadMessages = async () => {
    try {
      const allMessages: ChatMessage[] = [];
      const peopleIds: string[] = [];

      // Extract all messages from conversations
      rawConversations.forEach(conversation => {
        if (conversation.messages && conversation.messages.length > 0) {
          conversation.messages.forEach((message: any) => {
            if (message && message.personId) {
              allMessages.push({
                ...message,
                isOwn: message.personId === currentUserChurch?.person?.id
              });
              if (peopleIds.indexOf(message.personId) === -1) {
                peopleIds.push(message.personId);
              }
            }
          });
        }
      });

      // Load people data with error handling
      if (peopleIds.length > 0) {
        try {
          const people = await ApiHelper.get("/people/basic?ids=" + peopleIds.join(","), "MembershipApi");

          if (Array.isArray(people)) {
            // Attach person data to messages with safety checks
            allMessages.forEach(message => {
              if (message.personId) {
                const person = ArrayHelper.getOne(people, "id", message.personId);
                message.person = person || null; // Ensure we don't assign undefined
              }
            });
          }
        } catch (peopleError) {
          console.warn("Failed to load people data:", peopleError);
          // Continue without person data - messages will show without avatars
        }
      }

      // Sort by time
      allMessages.sort((a, b) => new Date(a.timeSent || 0).getTime() - new Date(b.timeSent || 0).getTime());
      setMessages(allMessages);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Find or create conversation
      let conversationId = rawConversations[0]?.id;
      if (!conversationId) {
        const conv = {
          groupId,
          allowAnonymousPosts: false,
          contentType: "group",
          contentId: groupId,
          title: `${groupName} Chat`,
          visibility: "hidden"
        };
        const result: ConversationInterface[] = await ApiHelper.post("/conversations", [conv], "MessagingApi");
        conversationId = result[0].id;
      }

      const message = {
        conversationId,
        content: newMessage.trim(),
        personId: currentUserChurch?.person?.id
      };

      await ApiHelper.post("/messages", [message], "MessagingApi");
      setNewMessage("");
      refetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isNextFromSame = index < messages.length - 1 && messages[index + 1]?.personId === item.personId;
    const isPrevFromSame = index > 0 && messages[index - 1]?.personId === item.personId;
    const showAvatar = !isNextFromSame;
    const showName = !isPrevFromSame && !item.isOwn;

    return (
      <View style={[styles.messageContainer, item.isOwn && styles.ownMessageContainer]}>
        {!item.isOwn && <View style={styles.avatarContainer}>{showAvatar ? <Avatar.Image size={32} source={item.person?.photo && item.person ? { uri: PersonHelper.getPhotoUrl(item.person) } : Constants.Images.ic_member} /> : <View style={styles.avatarSpacer} />}</View>}

        <View style={[styles.messageBubble, item.isOwn ? styles.ownBubble : styles.otherBubble]}>
          {showName && <Text style={styles.senderName}>{item.person?.name?.display || item.displayName}</Text>}
          <Text style={[styles.messageText, item.isOwn && styles.ownMessageText]}>{item.content}</Text>
          <Text style={[styles.timestamp, item.isOwn && styles.ownTimestamp]}>{dayjs(item.timeSent).format("h:mm A")}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Avatar.Icon size={64} icon="chat-outline" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Start the conversation</Text>
      <Text style={styles.emptySubtitle}>Be the first to share something with the group</Text>
    </View>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <Appbar.Header style={styles.header}>
            <Appbar.BackAction onPress={onDismiss} />
            <Appbar.Content title={groupName} titleStyle={styles.headerTitle} subtitle="Plan: M" subtitleStyle={styles.headerSubtitle} />
          </Appbar.Header>

          {/* Messages */}
          <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
            <FlatList ref={flatListRef} data={messages} keyExtractor={(item, index) => `${item.id || index}`} renderItem={renderMessage} contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false} ListEmptyComponent={renderEmptyState} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} />

            {/* Input Bar */}
            <Surface style={styles.inputBar}>
              <TextInput mode="outlined" placeholder="Send a message" value={newMessage} onChangeText={setNewMessage} multiline maxLength={500} style={styles.textInput} contentStyle={styles.inputContent} outlineStyle={styles.inputOutline} onSubmitEditing={sendMessage} blurOnSubmit={false} />
              <IconButton icon="send" size={24} onPress={sendMessage} disabled={!newMessage.trim()} style={[styles.sendButton, newMessage.trim() && styles.sendButtonActive]} iconColor={newMessage.trim() ? "#FFFFFF" : "#9E9E9E"} />
            </Surface>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#1565C0",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1565C0",
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
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 4,
    alignSelf: "flex-end"
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
    backgroundColor: "transparent"
  },
  inputContent: {
    fontSize: 15,
    lineHeight: 20,
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
    backgroundColor: "#1565C0"
  }
});

export default GroupChatModal;
