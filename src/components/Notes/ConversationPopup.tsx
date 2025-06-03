import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React, { useState } from "react";
import { FlatList, Keyboard, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { ApiHelper, Constants, ConversationInterface, UserHelper, globalStyles } from "@/src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import Notes from "./Notes";

interface NewConversation {
  placeholder: string;
  type: string;
  message?: MessageInterface;
}

const ConversationPopup = ({
  conversations,
  loadConversations,
  groupId,
}: any) => {
  const [newMessage] = useState<MessageInterface>();
  const [showReplyBox, setShowReplyBox] = useState<number | null>(null);
  const textRef = React.useRef('')

  const handleReply = (value: number) => setShowReplyBox(value);
  const onUpdate = () => loadConversations();

  const validate = (message: MessageInterface) => {
    const result: string[] = [];
    if (!message?.content || !message.content.trim()) result.push("Please enter a note.");
    return result.length === 0;
  };

  const handleSave = async (message: any) => {
    try {
      let m = { ...newMessage } as MessageInterface;
      m.content = textRef.current;

      if (m && validate(m)) {
        let cId = message && message.conversationId;
        if (!cId) cId = m && (await createConversation(m));
        const nM = { ...m };
        nM.conversationId = cId;
        await ApiHelper.post("/messages", [nM], "MessagingApi").then((data) => {
          if (data) {
            onUpdate();
            textRef.current = "";
            setShowReplyBox(null);
          }
        })
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const createConversation = async (message: MessageInterface) => {
    const conv: any = {
      groupId,
      allowAnonymousPosts: false,
      contentType: "group",
      contentId: groupId,
      title:
        UserHelper.user.firstName +
        " " +
        UserHelper.user.lastName +
        +" Conversation",
      visibility: "hidden",
    };
    const result: ConversationInterface[] = await ApiHelper.post(
      "/conversations",
      [conv],
      "MessagingApi"
    );

    const cId = result[0].id;
    return cId;
  };

  const getNotes = (item: any) => {
    let noteArray: React.ReactNode[] = [];
    for (let i = 1; i < item?.messages?.length; i++)
      noteArray.push(
        <Notes
          key={item.messages[i].id}
          item={[]}
          message={item.messages[i]}
          showReplyBox={showReplyBox}
          handleReply={handleReply}
        />
      );
    return noteArray;
  };
  const renderConversations = (item: any, index: number) => {
    return (
      <View>
        <RenderContent item={item} message={item.messages[0]} idx={index} />
      </View>
    );
  };

  const RenderContent = ({ item, message, idx }: any) => {
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#EFEFEF" }}>
        <Notes
          item={item}
          message={message}
          idx={idx}
          showReplyBox={showReplyBox}
          handleReply={handleReply}
        />
        {idx === showReplyBox && (
          <RenderNewConversation placeholder={"Reply ..."} type="reply" message={message} />
        )}
        <View style={{ marginLeft: 64 }}>{getNotes(item)}</View>
      </View>
    );
  };

  const RenderNewConversation = ({ placeholder, type, message }: NewConversation) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: '100%',
          marginTop: type === "new" ? 16 : 0,
          marginBottom: type === "new" ? 0 : 16,
        }}
      >
        <TextInput
          onChangeText={text => textRef.current = text}
          placeholderTextColor={'gray'}
          style={[{
            ...globalStyles.fundInput,
            fontSize: DimensionHelper.wp(4.2),
            borderBottomWidth: 1,
            borderWidth: 1,
            borderColor: 'lightgray',
            borderRadius: DimensionHelper.wp(6),
            marginLeft: type === "new" ? 8 : 64,
            width: type === "new" ? DimensionHelper.wp(80) : DimensionHelper.wp(66),
            paddingTop: DimensionHelper.hp(1.8),
          }]}
          multiline
          blurOnSubmit={true}
          onSubmitEditing={() => Keyboard.dismiss()}
          numberOfLines={4}
          placeholder={placeholder}
          value={newMessage?.content}
        />
        <TouchableOpacity
          style={{ marginHorizontal: DimensionHelper.wp(2.5) }}
          onPress={() => handleSave(message)}
        >
          <Icon
            name={"send"}
            color={Constants.Colors.app_color}
            size={DimensionHelper.wp(5)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <View style={{ height: 'auto', maxHeight: DimensionHelper.hp(60) }}>
        <FlatList
          data={conversations}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => renderConversations(item, index)}
          keyExtractor={(item, index) => item.id.toString()}
        />
      </View>
      <RenderNewConversation placeholder={"Start Conversation"} type="new" />
    </View>
  );
};

export default ConversationPopup;


