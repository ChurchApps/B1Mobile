import { DimensionHelper } from "@/helpers/DimensionHelper";
import React, { useState } from "react";
import { FlatList, Keyboard, View, StyleSheet } from "react-native";
import { ApiHelper, ConversationInterface } from "../../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import Notes from "./Notes";
import { TextInput, Text, Avatar, Card } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { useUser } from "../../stores/useUserStore";
import { useTranslation } from "react-i18next";

interface NewConversation {
  placeholder: string;
  type: string;
  message?: MessageInterface;
}

const ConversationPopup = ({ conversations, loadConversations, groupId }: any) => {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const [newMessage] = useState<MessageInterface>();
  const [showReplyBox, setShowReplyBox] = useState<number | null>(null);
  const textRef = React.useRef("");
  const user = useUser();

  const handleReply = (value: number) => setShowReplyBox(value);
  const onUpdate = () => loadConversations();

  const validate = (message: MessageInterface) => {
    const result: string[] = [];
    if (!message?.content || !message.content.trim()) result.push("Please enter a note.");
    return result.length === 0;
  };

  const handleSave = async (message: any) => {
    try {
      const m = { ...newMessage } as MessageInterface;
      m.content = textRef.current;

      if (m && validate(m)) {
        let cId = message && message.conversationId;
        if (!cId) cId = m && (await createConversation());
        const nM = { ...m };
        nM.conversationId = cId;
        await ApiHelper.post("/messages", [nM], "MessagingApi").then(data => {
          if (data) {
            onUpdate();
            textRef.current = "";
            setShowReplyBox(null);
          }
        });
      }
    } catch (err) {
      console.error("Error saving conversation:", err);
    }
  };

  const createConversation = async () => {
    const conv: any = {
      groupId,
      allowAnonymousPosts: false,
      contentType: "group",
      contentId: groupId,
      title: user?.firstName + " " + user?.lastName + " Conversation",
      visibility: "hidden"
    };
    const result: ConversationInterface[] = await ApiHelper.post("/conversations", [conv], "MessagingApi");

    if (!result || result.length === 0) {
      throw new Error("Failed to create conversation");
    }
    const cId = result[0].id;
    return cId;
  };

  const getNotes = (item: any) => {
    const noteArray: React.ReactNode[] = [];
    for (let i = 1; i < item?.messages?.length; i++) noteArray.push(<Notes key={item.messages[i].id} item={[]} message={item.messages[i]} showReplyBox={showReplyBox} handleReply={handleReply} />);
    return noteArray;
  };
  const renderConversations = (item: any, idx: number) => (
    <View>
      <RenderContent item={item} idx={idx} />
    </View>
  );

  const RenderContent = ({ item, idx }: any) => (
    <Card style={styles.messageCard}>
      <Card.Content style={styles.messageContent}>
        <Notes item={item} message={item.messages[0]} idx={idx} showReplyBox={showReplyBox} handleReply={handleReply} />
        {idx === showReplyBox && <RenderNewConversation placeholder={t("messages.reply")} type="reply" message={item.messages[0]} />}
        <View style={styles.repliesContainer}>{getNotes(item)}</View>
      </Card.Content>
    </Card>
  );

  const RenderNewConversation = ({ placeholder, type, message }: NewConversation) => (
    <Card style={[styles.inputCard, type === "new" && styles.newConversationCard]}>
      <Card.Content style={styles.inputContent}>
        <View style={styles.inputContainer}>
          <TextInput mode="outlined" onChangeText={text => (textRef.current = text)} placeholder={placeholder} multiline={true} numberOfLines={1} maxLength={500} style={[styles.textInput, type === "reply" && styles.replyInput]} contentStyle={styles.inputText} outlineStyle={styles.inputOutline} blurOnSubmit={false} onSubmitEditing={() => Keyboard.dismiss()} value={newMessage?.content} right={<TextInput.Icon icon="send" onPress={() => handleSave(message)} iconColor={theme.colors.primary} style={styles.sendIcon} />} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Icon size={32} icon="chat" style={styles.headerIcon} />
        <Text variant="titleMedium" style={styles.headerTitle}>
          {t("groups.groupChat")}
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {conversations.length > 0 ? (
          <FlatList data={conversations} showsVerticalScrollIndicator={false} renderItem={({ item, index }) => renderConversations(item, index)} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.messagesList} ItemSeparatorComponent={() => <View style={styles.messageSeparator} />} />
        ) : (
          <View style={styles.emptyState}>
            <Avatar.Icon size={64} icon="chat-outline" style={styles.emptyIcon} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {t("groups.noMessagesYet")}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {t("groups.startConversationToConnect")}
            </Text>
          </View>
        )}
      </View>

      {/* Input */}
      <RenderNewConversation placeholder={t("messages.typeYourMessage")} type="new" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    gap: 12
  },
  headerIcon: { backgroundColor: "#0D47A1" },
  headerTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    flex: 1
  },
  headerSubtitle: { color: "#9E9E9E" },
  messagesContainer: {
    flex: 1,
    maxHeight: DimensionHelper.hp(50)
  },
  messagesList: {
    padding: 12,
    flexGrow: 1
  },
  messageSeparator: { height: 8 },
  messageCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 2
  },
  messageContent: {
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  repliesContainer: {
    marginLeft: 48,
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#E9ECEF"
  },
  inputCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: "#FFFFFF"
  },
  newConversationCard: { marginBottom: 16 },
  inputContent: {
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    maxHeight: 120
  },
  replyInput: { marginLeft: 8 },
  inputText: {
    fontSize: 16,
    lineHeight: 20,
    paddingTop: 8
  },
  inputOutline: {
    borderColor: "#E9ECEF",
    borderWidth: 1
  },
  sendIcon: { marginRight: 4 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});

export default ConversationPopup;
