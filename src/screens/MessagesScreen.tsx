import { DimensionHelper } from '@churchapps/mobilehelper';
import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Text, TouchableWithoutFeedback, View } from "react-native";
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import MessageIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiHelper, Constants, ConversationCheckInterface, ConversationCreateInterface, EnvironmentHelper, MessageInterface, PrivateMessagesCreate, UserHelper, UserSearchInterface, globalStyles } from "../helpers";
import { eventBus } from '../helpers/PushNotificationHelper';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps,
  route: {
    params: { userDetails: UserSearchInterface }
  }
}

export const MessagesScreen: FunctionComponent<Props> = (props: Props) => {
  const [messageText, setMessageText] = useState('');
  const [messageList, setMessageList] = useState<MessageInterface[]>([]);
  const [editedMessage, setEditingMessage] = useState<MessageInterface | null>();
  const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface>();
  const [UserProfilePic, setUserProfilePic] = useState<string>('')
  const [isSending, setIsSending] = useState(false);

  const { showActionSheetWithOptions } = useActionSheet();

  const loadData = () => {
    getConversations();
    loadMembers();
  }

  // useEffect(() => {
  //   loadData();
  //   eventBus.addListener("badge", loadData);
  //   return () => { eventBus.removeListener("badge"); };
  // }, []);

  useEffect(() => {
    loadData();
    const handleBadgeUpdate = () => {
      loadData();
    };
    const handleNewMessage = (newMessage: MessageInterface) => {
      if (currentConversation && newMessage.conversationId === currentConversation.conversationId) {
        setMessageList((prevMessages) => [...prevMessages, newMessage]);
      }
    };
    eventBus.addListener("badge", handleBadgeUpdate);
    eventBus.addListener("newMessage", handleNewMessage);
    return () => {
      eventBus.removeListener("badge");
      eventBus.removeListener("newMessage");
    };
  }, [currentConversation]);


  const getConversations = () => {
    ApiHelper.get("/privateMessages/existing/" + props.route.params.userDetails.id, "MessagingApi").then((data) => {
      setCurrentConversation(data);
      if (Object.keys(data).length != 0 && data.conversationId != undefined) getMessagesList(data.conversationId)
    })
  }

  const loadMembers = () => {
    ApiHelper.get(`/people/ids?ids=${UserHelper.currentUserChurch.person.id}`, "MembershipApi").then(data => {
      if (data != null && data.length > 0) setUserProfilePic(data[0].photo)
    })
  }

  const getMessagesList = (conversationId: string) => {
    ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi").then(data => {
      var conversation: MessageInterface[] = data;
      conversation.reverse();
      setMessageList(conversation);
    })
  }

  const sendMessageInitiate = () => {
    if (messageText == "") return;
    if (currentConversation == null || currentConversation == undefined || Object.keys(currentConversation).length == 0) {
      let params = [{ "allowAnonymousPosts": false, "contentType": "privateMessage", "contentId": UserHelper.currentUserChurch.person.id, "title": UserHelper.user.firstName + " " + UserHelper.user.lastName + " Private Message", "visibility": "hidden" }]
      ApiHelper.post("/conversations", params, "MessagingApi").then(async (data: ConversationCreateInterface[]) => {
        if (data != null && data.length > 0 && data[0]?.id) {
          let params = [{ "fromPersonId": UserHelper.currentUserChurch.person.id, "toPersonId": props.route.params.userDetails.id, "conversationId": data[0]?.id }]
          ApiHelper.post("/privateMessages", params, "MessagingApi").then((data: PrivateMessagesCreate[]) => {
            if (data != null && data.length > 0 && data[0]?.id) {
              sendMessage(data[0].conversationId);
            }
          });
        }
      });
    } else sendMessage(currentConversation.conversationId);
  }

  const sendMessage = (conversationId: string) => {
    if (isSending) return;
    var params = {};
    if (editedMessage == null) params = [{ "conversationId": conversationId, "content": messageText }]
    else params = [{ "id": editedMessage.id, "churchId": editedMessage.churchId, "conversationId": conversationId, "userId": editedMessage.userId, "displayName": editedMessage.displayName, "timeSent": editedMessage.timeSent, "messageType": "message", "content": messageText, "personId": editedMessage.personId, "timeUpdated": null }]
    setIsSending(true);
    setMessageText('');
    ApiHelper.post("/messages", params, "MessagingApi").then(async (data: any) => {
      setEditingMessage(null);
      getConversations();
    }).catch(error => {
      console.log('Error sending message:', error);
    }).finally(() => {
      setIsSending(false);
    });
  }

  const deleteMessage = (messageId: string) => {
    ApiHelper.delete("/messages/" + messageId, "MessagingApi").then(async (data: any) => {
      getConversations();
      // if (data != null || data != undefined) {
      //   setMessageText("");
      //   setEditingMessage(null);
      //   getConversations();
      // }
    });
  }

  const backIconComponent = (<TouchableOpacity onPress={() => props.navigation.goBack()}>
    <Icon name={"keyboard-backspace"} style={globalStyles.menuIcon} color={"white"} size={DimensionHelper.wp('5%')} />
  </TouchableOpacity>);

  //const mainComponent = (<Text style={globalStyles.headerText}>{props?.route?.params?.userDetails?.name?.display ? props?.route?.params?.userDetails?.name?.display : props?.route?.params?.userDetails?.DisplayName }</Text>);

  const MessageHeader = () => (<View style={globalStyles.headerViewStyle}>
    <View style={[globalStyles.componentStyle, { flex: 2 }]}>{backIconComponent}</View>
    <View style={[globalStyles.componentStyle, { flex: 6.3 }]}><Text style={globalStyles.headerText}>Messages</Text></View>
    <View style={[globalStyles.componentStyle, { flex: 1.7, justifyContent: 'flex-end' }]}></View>
  </View>);

  const messageInputView = () => (<View style={globalStyles.messageInputContainer}>
    <TextInput style={globalStyles.messageInputStyle} placeholder={'Enter'} autoCapitalize="none"
      autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} value={messageText}
      onChangeText={(text) => {
        if (text == "") setEditingMessage(null)
        setMessageText(text)
      }}
    />
    <TouchableOpacity style={globalStyles.sendIcon} onPress={() => sendMessageInitiate()} disabled={isSending || messageText.trim() === ""}>
      <MessageIcon name={isSending ? "loader" : "send"} color={"white"} size={DimensionHelper.wp('5%')} />
    </TouchableOpacity>
  </View>);


  const messagesView = () => (<View style={{ flex: 1, backgroundColor: Constants.Colors.gray_bg }}>
    <FlatList inverted data={messageList} style={{ paddingVertical: DimensionHelper.wp('2%') }} renderItem={({ item }) => singleMessageItem(item)} keyExtractor={(item: any) => item.id} />
  </View>);

  // const singleMessageItem = (item: MessageInterface) => (<TouchableWithoutFeedback onLongPress={() => openContextMenu(item)}>
  //   <View style={[globalStyles.messageContainer, { alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start' }]}>
  //     {item.personId == props.route.params.userDetails.id ? <Image source={props?.route?.params?.userDetails?.photo ? { uri: EnvironmentHelper.ContentRoot + props?.route?.params?.userDetails?.photo } : Constants.Images.ic_user} style={[globalStyles.churchListIcon, { tintColor: props.route.params.userDetails.photo ? '' : Constants.Colors.app_color, height: DimensionHelper.wp('9%'), width: DimensionHelper.wp('9%'), borderRadius: DimensionHelper.wp('9%') }]} /> : null}
  //     <View>
  //       <Text style={[globalStyles.senderNameText, { alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start' }]}>{item.displayName}</Text>
  //       <View style={[globalStyles.messageView, { width: item.content.length > 15 ? DimensionHelper.wp('65%') : DimensionHelper.wp((item.content.length + 14).toString() + "%"), alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start' }]}>
  //         <Text>{item.content}</Text>
  //       </View>
  //     </View>
  //     {item.personId != props.route.params.userDetails.id ? <Image source={UserProfilePic ? { uri: EnvironmentHelper.ContentRoot + UserProfilePic } : Constants.Images.ic_user} style={[globalStyles.churchListIcon, { tintColor: UserProfilePic ? '' : Constants.Colors.app_color, height: DimensionHelper.wp('9%'), width: DimensionHelper.wp('9%'), borderRadius: DimensionHelper.wp('9%') }]} /> : null}
  //   </View>
  // </TouchableWithoutFeedback>);

  const singleMessageItem = (item: MessageInterface) => {
    const isSender = item.personId !== props.route.params.userDetails.id;

    return (
      <TouchableWithoutFeedback onLongPress={() => openContextMenu(item)}>
        <View style={{
          flexDirection: isSender ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          paddingVertical: DimensionHelper.wp('1%'),
          marginVertical: DimensionHelper.wp('2%'),
          paddingHorizontal: DimensionHelper.wp('2%')
        }}>
          {/* Profile Image */}
          <Image
            source={isSender
              ? (UserProfilePic
                ? { uri: EnvironmentHelper.ContentRoot + UserProfilePic }
                : Constants.Images.ic_user)
              : (props?.route?.params?.userDetails?.photo
                ? { uri: EnvironmentHelper.ContentRoot + props?.route?.params?.userDetails?.photo }
                : Constants.Images.ic_user)
            }
            style={{
              tintColor: isSender
                ? (UserProfilePic ? undefined : Constants.Colors.app_color)
                : (props.route.params.userDetails.photo ? undefined : Constants.Colors.app_color),
              height: DimensionHelper.wp('9%'),
              width: DimensionHelper.wp('9%'),
              borderRadius: DimensionHelper.wp('9%'),
              marginLeft: isSender ? DimensionHelper.wp('2%') : 0,
              marginRight: isSender ? 0 : DimensionHelper.wp('2%')
            }}
          />
          {/* Message Content */}
          <View style={{ maxWidth: DimensionHelper.wp('65%') }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: DimensionHelper.wp('1%'),
              textAlign: isSender ? 'right' : 'left'
            }}>
              {item.displayName}
            </Text>
            <View style={{
              backgroundColor: isSender ? Constants.Colors.app_color : Constants.Colors.app_color_light,
              borderRadius: 5,
              paddingHorizontal: DimensionHelper.wp('3%'),
              paddingVertical: DimensionHelper.wp('2%'),
              alignSelf: isSender ? 'flex-end' : 'flex-start',
              maxWidth: '100%'
            }}>
              <Text style={{ color: isSender ? 'white' : 'black', fontSize: 16 }}>
                {item.content}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const openContextMenu = (item: MessageInterface) => {
    if (item.personId !== UserHelper.currentUserChurch.person.id) {
      return;
    }
    const options = ['Edit', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex },
      (selectedIndex?: number) => {
        if (selectedIndex == 0) {
          setMessageText(item.content)
          setEditingMessage(item)
        } else if (selectedIndex == 1) deleteMessage(item.id)
      });
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      {/* <MainHeader title={'Messages'} openDrawer={props.navigation.openDrawer} ></MainHeader> */}
      <MessageHeader />
      {messagesView()}
      <KeyboardAvoidingView behavior="padding">{messageInputView()}</KeyboardAvoidingView>
    </SafeAreaView>
  );
}