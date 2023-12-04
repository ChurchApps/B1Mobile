import React, { useState, useEffect , FunctionComponent} from 'react';
import { ActionSheetIOS, Alert, Dimensions, FlatList, Image, KeyboardAvoidingView, PixelRatio, Text, TouchableWithoutFeedback, View } from "react-native";
import { LongPressGestureHandler, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MessageIcon from 'react-native-vector-icons/Feather';
import { MainHeader } from "../components";
import { ApiHelper, Constants, EnvironmentHelper, globalStyles, UserSearchInterface, ConversationCheckInterface, ConversationInterface, MessageInterface, UserHelper, ConversationCreateInterface, PrivateMessagesCreate } from "../helpers";
import { useActionSheet } from '@expo/react-native-action-sheet';

interface Props {
    navigation: {
      navigate: (screenName: string) => void;
      goBack: () => void;
      openDrawer: () => void;
    },
    route : {
        params : {
            userDetails : UserSearchInterface,
        }
    }
}

export const MessagesScreen  : FunctionComponent<Props> = (props: Props) => {
    const [messageText, setMessageText] = useState('');
    const [messageList, setMessageList] = useState<MessageInterface[]>([]);
    const [editedMessage, setEditingMessage] = useState<MessageInterface | null>();
    const [dimension, setDimension] = useState(Dimensions.get('window'));
    const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface>();
    const [UserProfilePic, setUserProfilePic]= useState<string>('')

    const { showActionSheetWithOptions } = useActionSheet();

    const wd = (number: string) => {
        let givenWidth = typeof number === "number" ? number : parseFloat(number);
        return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
    };

    useEffect(() => {
        getConversations();
        loadMembers();
    }, []);

    const getConversations = () => {
        ApiHelper.get("/privateMessages/existing/" + props.route.params.userDetails.id, "MessagingApi").then((data) => {
            setCurrentConversation(data);
            if(Object.keys(data).length != 0 && data.conversationId != undefined){
                getMessagesList(data.conversationId)
            }
        })
    }

        const loadMembers = () => {
        ApiHelper.get(`/people/ids?ids=${UserHelper.currentUserChurch.person.id}`, "MembershipApi").then(data => {
        if(data != null && data.length > 0){
            setUserProfilePic(data[0].photo)
            console.log(UserProfilePic)
        }
        })
      }
    const getMessagesList = (conversationId : string) => {
        ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi").then(data => {
            var conversation : MessageInterface[] = data;
            conversation.reverse();
            setMessageList(conversation);
        })
    }

    const sendMessageInitiate = () => {
        if(messageText == "") return;
       if(currentConversation == null || currentConversation == undefined || Object.keys(currentConversation).length == 0){
        let params = [{ "allowAnonymousPosts": false, "contentType": "privateMessage", "contentId": UserHelper.currentUserChurch.person.id, "title": UserHelper.user.firstName + " " + UserHelper.user.lastName+" Private Message", "visibility": "hidden" }]
        ApiHelper.post("/conversations", params, "MessagingApi").then(async (data: ConversationCreateInterface[]) => {
            if(data != null && data.length > 0 && data[0]?.id){
                let params = [{"fromPersonId": UserHelper.currentUserChurch.person.id, "toPersonId": props.route.params.userDetails.id, "conversationId": data[0]?.id}]
                ApiHelper.post("/privateMessages", params, "MessagingApi").then((data : PrivateMessagesCreate[]) => {
                    if(data != null && data.length > 0 && data[0]?.id){
                        sendMessage(data[0].conversationId);
                    }
                });
            }
        });
        } else{
            sendMessage(currentConversation.conversationId);
        }    
    }

    const sendMessage = (conversationId: string) => {
        var params = {};
        if(editedMessage == null){
            params = [{"conversationId": conversationId, "content": messageText}]
        }else{
            params = [{"id": editedMessage.id, "churchId": editedMessage.churchId, "conversationId": conversationId, "userId": editedMessage.userId, "displayName": editedMessage.displayName, "timeSent": editedMessage.timeSent, "messageType": "message", "content": messageText, "personId": editedMessage.personId, "timeUpdated": null}]
        }
        ApiHelper.post("/messages", params, "MessagingApi").then(async (data: any) => {
            if(data != null || data != undefined){
                ApiHelper.post("/devices/tempMessageUser", {"personId":props.route.params?.userDetails.id,  "body" : messageText, "title" : "new message" }, 
                "MessagingApi").then(async(data:any)=>{
                    console.log("temp message api response---->",data)
                })
                setMessageText('');
                setEditingMessage(null);
                getConversations();
            }
        });
    }
    
    const deleteMessage = (messageId: string) => {
        ApiHelper.delete("/messages/"+messageId, "MessagingApi").then(async (data: any) => {
            if(data != null || data != undefined){
                setMessageText('');
                setEditingMessage(null);
                getConversations();
            }
        });
    }

    const backIconComponent = (
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Icon name={"keyboard-backspace"} style={globalStyles.menuIcon} color={"white"} size={wp('5%')} />
        </TouchableOpacity>);

    const mainComponent = (<Text style={globalStyles.headerText}>{props?.route?.params?.userDetails?.name?.display ? props?.route?.params?.userDetails?.name?.display : props?.route?.params?.userDetails?.DisplayName }</Text>);

    const messageInputView = () => {
        return (
            <View style={globalStyles.messageInputContainer}>
                <TextInput
                    style={globalStyles.messageInputStyle}
                    placeholder={'Enter'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType='default'
                    placeholderTextColor={'lightgray'}
                    value={messageText}
                    onChangeText={(text) => { 
                        if(text == "") setEditingMessage(null)
                        setMessageText(text) 
                    }}
                />
                <TouchableOpacity style={globalStyles.sendIcon} onPress = {() => sendMessageInitiate()}>
                    <MessageIcon name={"send"} color={"white"} size={wp('5%')}/>
                </TouchableOpacity>
            </View>
        );
    }

    const messagesView = () => {
        return (
            <View style={{flex:1, backgroundColor:Constants.Colors.gray_bg}}>
                <FlatList
                    inverted
                    data={messageList} 
                    style = {{paddingVertical: wp('2%')}}
                    renderItem={({ item }) => singleMessageItem(item)} 
                    keyExtractor={(item: any) => item.id} 
                />
            </View>
        );
    }

    const singleMessageItem = (item : MessageInterface) => {
        return (
            <TouchableWithoutFeedback onLongPress={() => openContextMenu(item)}>
                <View style={[globalStyles.messageContainer, { alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start'}]}>
                     {item.personId == props.route.params.userDetails.id ? 
                        <Image source={props?.route?.params?.userDetails?.photo ? { uri: EnvironmentHelper.ContentRoot + props?.route?.params?.userDetails?.photo} : Constants.Images.ic_user } style={[globalStyles.churchListIcon, {tintColor: props.route.params.userDetails.photo ? '' : Constants.Colors.app_color, height: wp('9%'), width: wp('9%'), borderRadius : wp('9%')}]}/> 
                    : null}
                    <View>
                        <Text style={[globalStyles.senderNameText, {alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start'}]}>
                            {item.displayName}
                        </Text>
                        <View style={[globalStyles.messageView,{width: item.content.length > 15 ? wp('65%') : wp((item.content.length + 14).toString() + "%"), 
                            alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start'}]}>
                            <Text>{item.content}</Text>
                        </View>
                    </View>
                     {item.personId != props.route.params.userDetails.id ? 
                        <Image source={ UserProfilePic  ? {uri : EnvironmentHelper.ContentRoot + UserProfilePic}  :  Constants.Images.ic_user} style={[globalStyles.churchListIcon, {tintColor: UserProfilePic ? '' : Constants.Colors.app_color, height: wp('9%'), width: wp('9%'), borderRadius:wp('9%')}]}/> 
                    : null}
                </View>
            </TouchableWithoutFeedback>
        );
    }

    const openContextMenu = (item : MessageInterface) => {
        const options = ['Edit', 'Delete', 'Cancel'];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 2;
        showActionSheetWithOptions({
            options,
            cancelButtonIndex,
            destructiveButtonIndex
          }, (selectedIndex?: number) => {
            if(selectedIndex == 0){
                setMessageText(item.content)
                setEditingMessage(item)
              }else if(selectedIndex == 1){
                deleteMessage(item.id)
              }
          });
      };

    return (
    <SafeAreaView style={globalStyles.homeContainer}>
        <MainHeader leftComponent={backIconComponent} mainComponent={mainComponent} rightComponent={null}></MainHeader>
        {messagesView()}
        <KeyboardAvoidingView behavior="padding">{messageInputView()}</KeyboardAvoidingView>
    </SafeAreaView>
    );
}