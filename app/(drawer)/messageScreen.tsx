import React from 'react';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { useActionSheet } from '@expo/react-native-action-sheet'; // External library, keep for now
import { useEffect, useState } from 'react';

import { ApiHelper, Constants, ConversationCheckInterface, ConversationCreateInterface, EnvironmentHelper, UserHelper, UserSearchInterface, globalStyles } from "@/src/helpers"; // Constants needed for Images
import { MessageInterface } from "@churchapps/helpers";
import { PrivateMessagesCreate } from "@/src/helpers/Interfaces";
import { eventBus } from '@/src/helpers/PushNotificationHelper';
import { NavigationProps } from '@/src/interfaces'; // Unused
// MessageIcon (Feather) and Icon (MaterialCommunityIcons) will be mapped or replaced by Paper IconButton
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Image, KeyboardAvoidingView, TouchableWithoutFeedback, View, StyleSheet, Platform } from "react-native"; // Text, TouchableOpacity removed
// TextInput from RNGH removed
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { Appbar, Avatar, Surface, Text as PaperText, TextInput as PaperTextInput, useTheme, IconButton as PaperIconButton } from 'react-native-paper';

// Props interface seems unused
// interface Props {
//   navigation: NavigationProps,
//   route: { params: { userDetails: UserSearchInterface } }
// }

const MessageScreen = () => { // Removed props: Props
  const theme = useTheme();
  const { userDetails: userDetailsString } = useLocalSearchParams<{ userDetails: string }>();
  const details = userDetailsString ? JSON.parse(userDetailsString) : null;

  const [messageText, setMessageText] = useState('');
  const [messageList, setMessageList] = useState<MessageInterface[]>([]);
  const [editedMessage, setEditingMessage] = useState<MessageInterface | null>(null); // Typed null
  const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface | null>(null); // Typed null
  const [userProfilePic, setUserProfilePic] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { showActionSheetWithOptions } = useActionSheet();

  // loadData, getConversations, loadMembers, getMessagesList, sendMessageInitiate, sendMessage, deleteMessage logic remains the same
  const loadData = () => { getConversations(); loadMembers(); };
  useEffect(() => { loadData(); eventBus.addListener("badge", loadData); return () => { eventBus.removeListener("badge"); }; }, []);
  const getConversations = () => { if(details?.id) ApiHelper.get("/privateMessages/existing/" + details.id, "MessagingApi").then((data) => { setCurrentConversation(data); if (data?.conversationId) getMessagesList(data.conversationId); }); };
  const loadMembers = () => { if(UserHelper.currentUserChurch?.person?.id) ApiHelper.get(`/people/ids?ids=${UserHelper.currentUserChurch.person.id}`, "MembershipApi").then(data => { if (data?.[0]?.photo) setUserProfilePic(data[0].photo); }); };
  const getMessagesList = (conversationId: string) => { ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi").then(data => { setMessageList((data || []).reverse()); }); };
  const sendMessageInitiate = () => { /* ... existing logic ... */
    if (messageText.trim() === "") return;
    if (!currentConversation?.conversationId) {
      let params = [{ "allowAnonymousPosts": false, "contentType": "privateMessage", "contentId": UserHelper.currentUserChurch.person.id, "title": UserHelper.user.firstName + " " + UserHelper.user.lastName + " Private Message", "visibility": "hidden" }]
      ApiHelper.post("/conversations", params, "MessagingApi").then(async (data: ConversationCreateInterface[]) => {
        if (data?.[0]?.id) {
          let paramsPM = [{ "fromPersonId": UserHelper.currentUserChurch.person.id, "toPersonId": details.id, "conversationId": data[0]?.id }]
          ApiHelper.post("/privateMessages", paramsPM, "MessagingApi").then((pmData: PrivateMessagesCreate[]) => {
            if (pmData?.[0]?.conversationId) sendMessage(pmData[0].conversationId);
          });
        }
      });
    } else sendMessage(currentConversation.conversationId);
  };
  const sendMessage = (conversationId: string) => { /* ... existing logic ... */
    var params = {};
    if (editedMessage == null) params = [{ "conversationId": conversationId, "content": messageText }]
    else params = [{ "id": editedMessage.id, "churchId": editedMessage.churchId, "conversationId": conversationId, "displayName": editedMessage.displayName, "timeSent": editedMessage.timeSent, "messageType": "message", "content": messageText, "personId": editedMessage.personId, "timeUpdated": null }]
    ApiHelper.post("/messages", params, "MessagingApi").then(async () => { setMessageText(''); setEditingMessage(null); getConversations(); });
  };
  const deleteMessage = (messageId: string) => { /* ... existing logic ... */
    ApiHelper.delete("/messages/" + messageId, "MessagingApi").then(async () => { setMessageText(""); setEditingMessage(null); getConversations(); });
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.primary }, // Assuming MessageHeader was primary-colored
    headerTitle: { color: theme.colors.onPrimary },
    messagesViewContainer: { flex: 1, backgroundColor: theme.colors.background }, // Changed from gray_bg
    flatListStyle: { paddingVertical: DimensionHelper.wp(2) },
    messageInputContainer: { ...globalStyles.messageInputContainer, flexDirection: 'row', alignItems: 'center', padding: theme.spacing?.sm, backgroundColor: theme.colors.surfaceVariant },
    messageInputStyle: { ...globalStyles.messageInputStyle, flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
    // sendIcon: { ...globalStyles.sendIcon }, // Replaced by TextInput.Icon
    messageContainer: (isOwnMessage: boolean) => ({
      ...globalStyles.messageContainer,
      alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
      maxWidth: '80%', // Prevent bubbles from being too wide
      marginVertical: 4,
    }),
    avatarStyle: {
      ...globalStyles.churchListIcon,
      height: DimensionHelper.wp(9), width: DimensionHelper.wp(9), borderRadius: DimensionHelper.wp(4.5),
      marginHorizontal: 4,
      backgroundColor: theme.colors.surfaceVariant, // Fallback bg for avatar
    },
    senderNameText: (isOwnMessage: boolean) => ({
      ...globalStyles.senderNameText,
      alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
      color: theme.colors.onSurfaceVariant,
      fontSize: 12, // Example, use theme variant if possible
      marginBottom: 2,
    }),
    messageBubble: (isOwnMessage: boolean) => ({
      ...globalStyles.messageView, // Keep padding, borderRadius etc.
      backgroundColor: isOwnMessage ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
      // width: 'auto', // Let content define width up to maxWidth
      // alignSelf: isOwnMessage ? 'flex-end' : 'flex-start', // Handled by messageContainer
    }),
    messageContentText: (isOwnMessage: boolean) => ({
      color: isOwnMessage ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
    }),
  });

  const MessageHeader = () => (
    <Appbar.Header style={styles.header}>
      <Appbar.BackAction onPress={() => router.canGoBack() ? router.back() : router.navigate('/(drawer)/dashboard')} color={theme.colors.onPrimary} />
      <Appbar.Content title={details?.name?.display || details?.displayName || "Messages"} titleStyle={styles.headerTitle} />
      {/* Optional: Add other actions if needed */}
    </Appbar.Header>
  );

  const messageInputView = () => (
    <View style={styles.messageInputContainer}>
      <PaperTextInput
        style={styles.messageInputStyle}
        placeholder='Enter message'
        value={messageText}
        onChangeText={(text) => {
          if (text === "") setEditingMessage(null);
          setMessageText(text);
        }}
        mode="outlined" // Or "flat"
        dense
        multiline
        right={
          <PaperTextInput.Icon
            icon="send"
            color={theme.colors.primary}
            onPress={sendMessageInitiate}
            disabled={messageText.trim() === ""}
          />
        }
      />
    </View>
  );

  const singleMessageItem = ({ item }: { item: MessageInterface }) => {
    const isOwnMessage = item.personId !== details?.id;
    const avatarPhoto = isOwnMessage ? UserProfilePic : details?.photo;
    const avatarDefaultIcon = Constants.Images.ic_user;
    const displayName = item.displayName || item.person?.name?.display || 'Unknown';

    return (
      <TouchableWithoutFeedback onLongPress={() => item.personId === UserHelper.currentUserChurch.person.id && openContextMenu(item)}>
        <View style={styles.messageContainer(isOwnMessage)}>
          {!isOwnMessage && (
            <Avatar.Image size={DimensionHelper.wp(9)} style={styles.avatarStyle} source={avatarPhoto ? { uri: EnvironmentHelper.ContentRoot + avatarPhoto } : avatarDefaultIcon} />
          )}
          <View style={{maxWidth: '85%'}}> {/* Wrapper for text content to constrain width for bubble */}
            {!isOwnMessage && <PaperText style={styles.senderNameText(isOwnMessage)}>{displayName}</PaperText>}
            <Surface style={styles.messageBubble(isOwnMessage)} elevation={1}>
              <PaperText style={styles.messageContentText(isOwnMessage)}>{item.content || ''}</PaperText>
            </Surface>
          </View>
          {isOwnMessage && (
             <Avatar.Image size={DimensionHelper.wp(9)} style={styles.avatarStyle} source={avatarPhoto ? { uri: EnvironmentHelper.ContentRoot + avatarPhoto } : avatarDefaultIcon} />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const openContextMenu = (item: MessageInterface) => { /* ... existing logic ... */
    const options = ['Edit', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 1; // Delete is usually destructive
    const cancelButtonIndex = 2;
    showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex },
      (selectedIndex?: number) => {
        if (selectedIndex === 0 && item.content) { setMessageText(item.content); setEditingMessage(item); }
        else if (selectedIndex === 1 && item.id) { deleteMessage(item.id); }
      });
  };

  if (!details) { // Handle case where details might be null
    return (
      <SafeAreaView style={styles.safeArea}>
        <MessageHeader />
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <PaperText variant="headlineSmall">User details not found.</PaperText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LoadingWrapper loading={loading}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}> {/* Keep top edge for Appbar */}
        <MessageHeader />
        <View style={styles.messagesViewContainer}>
          <FlatList inverted data={messageList} style={styles.flatListStyle} renderItem={singleMessageItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 80}>
          {messageInputView()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default MessageScreen;
