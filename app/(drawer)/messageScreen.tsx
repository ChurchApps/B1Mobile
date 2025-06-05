import React from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useEffect, useState } from "react";
import { ApiHelper, ConversationCheckInterface, ConversationCreateInterface, UserHelper } from "@/src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import { PrivateMessagesCreate } from "@/src/helpers/Interfaces";
import { eventBus } from "@/src/helpers/PushNotificationHelper";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, View, Platform } from "react-native";
import { useAppTheme } from "@/src/theme";
import { IconButton, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";

const MessageScreen = () => {
  const { userDetails } = useLocalSearchParams<{ userDetails: any }>();
  const details = JSON.parse(userDetails);
  const { theme, spacing } = useAppTheme();
  const [messageText, setMessageText] = useState("");
  const [messageList, setMessageList] = useState<MessageInterface[]>([]);
  const [editedMessage, setEditingMessage] = useState<MessageInterface | null>();
  const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface>();
  const [loading, setLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

  const loadData = () => {
    getConversations();
    loadMembers();
  };

  useEffect(() => {
    loadData();
    eventBus.addListener("badge", loadData);
    return () => {
      eventBus.removeListener("badge");
    };
  }, []);

  const getConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages/existing/" + details.id, "MessagingApi").then(data => {
      setCurrentConversation(data);
      if (Object.keys(data).length != 0 && data.conversationId != undefined) getMessagesList(data.conversationId);
      setLoading(false);
    });
  };

  const loadMembers = () => {
    ApiHelper.get(`/people/ids?ids=${UserHelper.currentUserChurch.person.id}`, "MembershipApi");
  };

  const getMessagesList = (conversationId: string) => {
    ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi").then(data => {
      let conversation: MessageInterface[] = data;
      conversation.reverse();
      setMessageList(conversation);
    });
  };

  const sendMessageInitiate = () => {
    if (messageText == "") return;
    if (currentConversation == null || currentConversation == undefined || Object.keys(currentConversation).length == 0) {
      let params = [
        {
          allowAnonymousPosts: false,
          contentType: "privateMessage",
          contentId: UserHelper.currentUserChurch.person.id,
          title: UserHelper.user.firstName + " " + UserHelper.user.lastName + " Private Message",
          visibility: "hidden"
        }
      ];
      ApiHelper.post("/conversations", params, "MessagingApi").then(async (data: ConversationCreateInterface[]) => {
        if (data != null && data.length > 0 && data[0]?.id) {
          let params = [{ fromPersonId: UserHelper.currentUserChurch.person.id, toPersonId: details.id, conversationId: data[0]?.id }];
          ApiHelper.post("/privateMessages", params, "MessagingApi").then((data: PrivateMessagesCreate[]) => {
            if (data != null && data.length > 0 && data[0]?.id) {
              sendMessage(data[0].conversationId);
            }
          });
        }
      });
    } else sendMessage(currentConversation.conversationId);
  };

  const sendMessage = (conversationId: string) => {
    let params = {};
    if (editedMessage == null) params = [{ conversationId: conversationId, content: messageText }];
    else
      params = [
        {
          id: editedMessage.id,
          churchId: editedMessage.churchId,
          conversationId: conversationId,
          displayName: editedMessage.displayName,
          timeSent: editedMessage.timeSent,
          messageType: "message",
          content: messageText,
          personId: editedMessage.personId,
          timeUpdated: null
        }
      ];

    ApiHelper.post("/messages", params, "MessagingApi").then(() => {
      setMessageText("");
      setEditingMessage(null);
      getConversations();
    });
  };

  const deleteMessage = (messageId: string) => {
    ApiHelper.delete("/messages/" + messageId, "MessagingApi").then(async (data: any) => {
      if (data != null || data != undefined) {
        setMessageText("");
        setEditingMessage(null);
        getConversations();
      }
    });
  };

  const MessageHeader = () => (
    <Surface style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, elevation: 4 }}>
      <IconButton icon="arrow-left" size={28} iconColor="white" onPress={() => router.navigate("/(drawer)/dashboard")} />
      <Text variant="titleLarge" style={{ color: "white", fontWeight: "600", flex: 1 }}>
        Messages
      </Text>
    </Surface>
  );

  const messageInputView = () => (
    <Surface style={{ flexDirection: "row", alignItems: "center", padding: spacing.sm, backgroundColor: theme.colors.surface, borderRadius: theme.roundness, margin: spacing.md, elevation: 2 }}>
      <TextInput
        style={{ flex: 1, backgroundColor: theme.colors.surface }}
        mode="outlined"
        placeholder={"Enter message"}
        value={messageText}
        onChangeText={text => {
          if (text == "") setEditingMessage(null);
          setMessageText(text);
        }}
        left={<TextInput.Icon icon="message" />}
      />
      <IconButton icon="send" size={28} iconColor={theme.colors.primary} onPress={sendMessageInitiate} style={{ marginLeft: spacing.sm }} />
    </Surface>
  );

  const messagesView = () => (
    <FlatList
      inverted
      data={messageList}
      style={{ paddingVertical: spacing.md }}
      renderItem={({ item }) => singleMessageItem(item)}
      keyExtractor={(item: any) => item.id}
      contentContainerStyle={{ paddingBottom: spacing.lg }}
    />
  );

  const singleMessageItem = (item: MessageInterface) => {
    const isMine = item.personId !== details.id;
    return (
      <TouchableWithoutFeedback onLongPress={() => openContextMenu(item)}>
        <Surface
          style={{
            alignSelf: isMine ? "flex-end" : "flex-start",
            backgroundColor: isMine ? theme.colors.primary : theme.colors.surface,
            borderRadius: theme.roundness,
            marginVertical: 4,
            marginHorizontal: spacing.md,
            padding: spacing.sm,
            maxWidth: "75%",
            elevation: 2
          }}>
          <Text variant="labelSmall" style={{ color: isMine ? "white" : theme.colors.primary, fontWeight: "600", marginBottom: 2 }}>
            {item.displayName || item.person?.name?.display || "Unknown"}
          </Text>
          <Text style={{ color: isMine ? "white" : theme.colors.onSurface }}>{item.content || ""}</Text>
        </Surface>
      </TouchableWithoutFeedback>
    );
  };

  const openContextMenu = (item: MessageInterface) => {
    const options = ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (selectedIndex?: number) => {
      if (selectedIndex === 0 && item.content) {
        setMessageText(item.content);
        setEditingMessage(item);
      } else if (selectedIndex === 1 && item.id) {
        deleteMessage(item.id);
      }
    });
  };

  return (
    <LoadingWrapper loading={loading}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <MessageHeader />
        <View style={{ flex: 1 }}>{messagesView()}</View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>{messageInputView()}</KeyboardAvoidingView>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default MessageScreen;
