import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, FlatList, Image, KeyboardAvoidingView, PixelRatio, Text, View } from "react-native";
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MessageIcon from 'react-native-vector-icons/Feather';
import { MainHeader } from "../components";
import { ApiHelper, Constants, globalStyles, UserSearchInterface, ConversationCheckInterface, ConversationInterface, MessageInterface } from "../helpers";

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

export const MessagesScreen = (props: Props) => {
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageList, setMessageList] = useState<MessageInterface[]>([]);
    const [dimension, setDimension] = useState(Dimensions.get('window'));
    const [currentConversation, setCurrentConversation] = useState<ConversationCheckInterface>();

    const wd = (number: string) => {
        let givenWidth = typeof number === "number" ? number : parseFloat(number);
        return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
    };

    useEffect(() => {
        getConversations();
    }, []);

    const getConversations = () => {
        setLoading(true);
        ApiHelper.get("/privateMessages/existing/" + props.route.params.userDetails.id, "MessagingApi").then((data: ConversationCheckInterface) => {
            setLoading(false);
            setCurrentConversation(data);
            if(Object.keys(data).length != 0 && data.conversationId != undefined){
                ApiHelper.get("/messages/conversation/" + data.conversationId, "MessagingApi").then(data => {
                    setLoading(false);
                    var conversation : MessageInterface[] = data;
                    conversation.reverse();
                    setMessageList(conversation);
                })
            }  
        })
    }

    const sendMessage = () => {
       if(currentConversation == null || currentConversation == undefined){
            Alert.alert('No conversation found');
            return;
        }
        let params = [{"conversationId": currentConversation.conversationId, "content": messageText}]
        ApiHelper.post("/messages", params, "MessagingApi").then(async (data: any) => {
            if(data != null || data != undefined){
                setMessageText('');
                getConversations();
            }
        });
    }

    const backIconComponent = (
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Icon name={"keyboard-backspace"} style={globalStyles.menuIcon} color={"white"} size={wp('5%')} />
        </TouchableOpacity>);

    const mainComponent = (<Text style={globalStyles.headerText}>{props.route.params.userDetails.name.display}</Text>);

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
                    onChangeText={(text) => { setMessageText(text) }}
                />
                <TouchableOpacity style={globalStyles.sendIcon} onPress = {() => sendMessage()}>
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
            <View style={[globalStyles.messageContainer, { alignSelf: item.personId != props.route.params.userDetails.id ? 'flex-end' : 'flex-start'}]}>
                {item.personId == props.route.params.userDetails.id ? 
                    <Image source={Constants.Images.ic_user} style={[globalStyles.churchListIcon, {tintColor: Constants.Colors.app_color, height: wp('9%'), width: wp('9%')}]}/> 
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
                    <Image source={Constants.Images.ic_user} style={[globalStyles.churchListIcon, {tintColor: Constants.Colors.app_color, height: wp('9%'), width: wp('9%')}]}/> 
                : null}
            </View>
        );
    }

    return (
    <SafeAreaView style={globalStyles.homeContainer}>
        <MainHeader leftComponent={backIconComponent} mainComponent={mainComponent} rightComponent={null}></MainHeader>
        {messagesView()}
        <KeyboardAvoidingView behavior="padding">{messageInputView()}</KeyboardAvoidingView>
    </SafeAreaView>
    );
}