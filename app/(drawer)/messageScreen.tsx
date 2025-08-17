import React from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useEffect, useState, useCallback, useRef } from "react";
import { ApiHelper, ConversationCheckInterface, ConversationCreateInterface } from "../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import { PrivateMessagesCreate } from "../../src/helpers/Interfaces";
import { eventBus, updateCurrentScreen } from "../../src/helpers/PushNotificationHelper";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { useNavigation } from "../../src/hooks";
import { FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../src/theme";
import { IconButton, Surface, Text, TextInput } from "react-native-paper";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { useUser, useCurrentUserChurch } from "../../src/stores/useUserStore";

interface NotificationContent {
  autoDismiss?: boolean;
  badge?: number | null;
  body?: string;
  data?: {
    body?: string;
    title?: string;
    type?: string;
    chatId?: string;
    conversationId?: string;
    [key: string]: any;
  };
  dataString?: string;
  priority?: string;
  sound?: string;
  sticky?: boolean;
  subtitle?: string | null;
  title?: string;
}

const MessageScreen = () => {
  const { userDetails } = useLocalSearchParams<{ userDetails: any }>();
  console.log("Raw userDetails param:", userDetails);
  const details = userDetails ? JSON.parse(userDetails) : null;
  console.log("Parsed details:", details);

  // Add early return if no details
  if (!details || !details.id) {
    console.error("No user details provided to MessageScreen", { userDetails, details });
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: No user details provided</Text>
      </SafeAreaView>
    );
  }
  const { theme, spacing } = useAppTheme();
  const { navigateBack } = useNavigation();
  const [messageText, setMessageText] = useState("");
  const [messageList, setMessageList] = useState<MessageInterface[]>([]);
  const [editedMessage, setEditingMessage] = useState<MessageInterface | null>();
  const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface>();
  const [loading, setLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const conversationIdRef = useRef<string | undefined>(undefined);
  const user = useUser();
  const currentUserChurch = useCurrentUserChurch();

  // Update ref when conversation changes
  useEffect(() => {
    conversationIdRef.current = currentConversation?.conversationId;
  }, [currentConversation?.conversationId]);

  // Update screen tracking when component mounts/unmounts
  useEffect(() => {
    updateCurrentScreen("/(drawer)/messageScreen");
    return () => updateCurrentScreen("");
  }, []);

  const getMessagesList = useCallback((conversationId: string) => {
    if (!conversationId) {
      console.log("No conversationId provided to getMessagesList");
      return;
    }
    console.log("Fetching messages for conversation:", conversationId);
    ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi")
      .then(data => {
        console.log("Messages received:", data);
        if (data && Array.isArray(data)) {
          let conversation: MessageInterface[] = data;
          conversation.reverse();
          setMessageList(conversation);
        } else {
          console.log("Invalid messages data:", data);
          setMessageList([]);
        }
      })
      .catch((error: any) => {
        console.error("Error fetching messages:", error);
        setMessageList([]);
      });
  }, []);

  const getConversations = useCallback(() => {
    setLoading(true);
    console.log("Getting conversations for user:", details.id);
    
    // Get all private messages and find the conversation with the specific user
    ApiHelper.get("/privateMessages", "MessagingApi")
      .then((data: ConversationCheckInterface[]) => {
        console.log("All private messages received:", data);
        
        // Find conversation between current user and the target person
        const targetConversation = data.find(conversation => 
          (conversation.fromPersonId === currentUserChurch?.person?.id && conversation.toPersonId === details.id) ||
          (conversation.toPersonId === currentUserChurch?.person?.id && conversation.fromPersonId === details.id)
        );
        
        console.log("Target conversation found:", targetConversation);
        
        if (targetConversation && targetConversation.conversationId) {
          setCurrentConversation(targetConversation);
          getMessagesList(targetConversation.conversationId);
        } else {
          console.log("No existing conversation found between users");
          setCurrentConversation(undefined);
          setMessageList([]);
        }
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      });
  }, [details.id, getMessagesList, currentUserChurch?.person?.id]);

  const loadData = useCallback(() => {
    getConversations();
    loadMembers();
  }, [getConversations]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (content: NotificationContent) => {
      // Only refresh if the notification is for this conversation
      if (content.data?.conversationId && conversationIdRef.current && content.data.conversationId === conversationIdRef.current) {
        getMessagesList(conversationIdRef.current);
      }
    };

    // Listen for notification updates
    const handleNotification = (content: NotificationContent) => {
      // Only refresh if the notification is for this conversation
      if (content.data?.conversationId && conversationIdRef.current && content.data.conversationId === conversationIdRef.current) {
        getMessagesList(conversationIdRef.current);
      }
    };

    // Listen for any conversation updates
    const handleConversationUpdate = (data?: { conversationId?: string }) => {
      // If we have a specific conversation ID, only refresh if it matches
      if (data?.conversationId && conversationIdRef.current && data.conversationId === conversationIdRef.current) {
        getMessagesList(conversationIdRef.current);
      } else if (!data?.conversationId) {
        // If no specific conversation ID, refresh everything
        loadData();
      }
    };

    eventBus.addListener("updateChatMessages", handleNewMessage);
    eventBus.addListener("notification", handleNotification);
    eventBus.addListener("conversationUpdate", handleConversationUpdate);

    // Initial load
    loadData();

    return () => {
      eventBus.removeListener("updateChatMessages");
      eventBus.removeListener("notification");
      eventBus.removeListener("conversationUpdate");
    };
  }, [getMessagesList, loadData]);

  // Add polling for new messages when screen is focused
  useFocusEffect(
    useCallback(() => {
      const pollInterval = setInterval(() => {
        if (conversationIdRef.current) {
          getMessagesList(conversationIdRef.current);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }, [getMessagesList])
  );

  const loadMembers = () => {
    if (currentUserChurch?.person?.id) {
      ApiHelper.get(`/people/ids?ids=${currentUserChurch.person.id}`, "MembershipApi");
    }
  };

  const sendMessageInitiate = () => {
    if (messageText == "") return;
    if (!currentUserChurch?.person?.id) return;
    if (currentConversation == null || currentConversation == undefined || Object.keys(currentConversation).length == 0) {
      let params = [
        {
          allowAnonymousPosts: false,
          contentType: "privateMessage",
          contentId: currentUserChurch.person.id,
          title: user?.firstName + " " + user?.lastName + " Private Message",
          visibility: "hidden"
        }
      ];
      ApiHelper.post("/conversations", params, "MessagingApi").then(async (data: ConversationCreateInterface[]) => {
        if (data != null && data.length > 0 && data[0]?.id) {
          let params = [{ fromPersonId: currentUserChurch.person.id, toPersonId: details.id, conversationId: data[0]?.id }];
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
      // Emit event with conversation ID for more targeted updates
      eventBus.emit("conversationUpdate", { conversationId });
      // Refresh messages immediately
      getMessagesList(conversationId);
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
      <IconButton icon="arrow-left" size={28} iconColor="white" onPress={() => navigateBack()} />
      <Text variant="titleLarge" style={{ color: "white", fontWeight: "600", flex: 1 }}>
        {details?.name?.display || details?.DisplayName || "Messages"}
      </Text>
      <IconButton
        icon="account-plus"
        size={28}
        iconColor="white"
        onPress={() => router.push("/(drawer)/searchMessageUser")}
      />
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

  const messagesView = () => {
    console.log("Rendering messages view with messageList:", messageList);
    console.log("Message count:", messageList.length);

    if (messageList.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>No messages yet</Text>
        </View>
      );
    }
    //console.log("******************MESSAGELIST:", messageList.length);

    return (
      <FlatList
        inverted
        data={messageList}
        style={{ flex: 1 }}
        renderItem={({ item }) => singleMessageItem(item)}
        keyExtractor={(item: any) => item.id || Math.random().toString()}
        contentContainerStyle={{
          paddingVertical: spacing.md,
          flexGrow: 1,
          justifyContent: 'flex-end'
        }}
        initialNumToRender={15}
        windowSize={10}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
      />
    );
  };

  const singleMessageItem = (item: MessageInterface) => {
    console.log("Rendering single message item:", item);
    console.log("Current user person id:", currentUserChurch?.person?.id);
    // Check if the message is from the current user
    const isMine = item.personId === currentUserChurch?.person?.id;
    console.log("Is mine?", isMine, "item.personId:", item.personId, "currentUserChurch.person.id:", currentUserChurch?.person?.id);

    return (
      <TouchableWithoutFeedback onLongPress={() => openContextMenu(item)}>
        <View style={{ width: '100%', paddingHorizontal: spacing.sm }}>
          <Surface
            style={{
              alignSelf: isMine ? "flex-end" : "flex-start",
              backgroundColor: isMine ? theme.colors.primary : theme.colors.surfaceVariant,
              borderRadius: theme.roundness,
              marginVertical: 4,
              padding: spacing.sm,
              maxWidth: "75%",
              elevation: 2,
              minHeight: 40
            }}>
            <Text variant="labelSmall" style={{ color: isMine ? "white" : theme.colors.primary, fontWeight: "600", marginBottom: 2 }}>
              {item.displayName || item.person?.name?.display || "Unknown"}
            </Text>
            <Text style={{ color: isMine ? "white" : theme.colors.onSurface }}>{item.content || ""}</Text>
          </Surface>
        </View>
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
