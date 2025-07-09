import { DimensionHelper } from "@/helpers/DimensionHelper";
import React, { useState } from "react";
import { FlatList, Keyboard, View } from "react-native";
import { ApiHelper, ConversationInterface } from "../../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import Notes from "./Notes";
import { TextInput, IconButton, Surface } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { useUser } from "../../stores/useUserStore";

interface NewConversation {
  placeholder: string;
  type: string;
  message?: MessageInterface;
}

const ConversationPopup = ({ conversations, loadConversations, groupId }: any) => {
  const { theme, componentStyles, spacing } = useAppTheme();
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
      let m = { ...newMessage } as MessageInterface;
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
      console.log("err", err);
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

    const cId = result[0].id;
    return cId;
  };

  const getNotes = (item: any) => {
    let noteArray: React.ReactNode[] = [];
    for (let i = 1; i < item?.messages?.length; i++) noteArray.push(<Notes key={item.messages[i].id} item={[]} message={item.messages[i]} showReplyBox={showReplyBox} handleReply={handleReply} />);
    return noteArray;
  };
  const renderConversations = (item: any, idx: number) => (
    <View>
      <RenderContent item={item} idx={idx} />
    </View>
  );

  const RenderContent = ({ item, idx }: any) => (
    <View style={{ borderBottomWidth: 1, borderBottomColor: "#EFEFEF" }}>
      <Notes item={item} message={item.messages[0]} idx={idx} showReplyBox={showReplyBox} handleReply={handleReply} />
      {idx === showReplyBox && <RenderNewConversation placeholder={"Reply ..."} type="reply" message={item.messages[0]} />}
      <View style={{ marginLeft: 64 }}>{getNotes(item)}</View>
    </View>
  );

  const RenderNewConversation = ({ placeholder, type, message }: NewConversation) => (
    <Surface
      style={{
        ...componentStyles.surface,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: type === "new" ? spacing.lg : 0,
        marginBottom: type === "new" ? spacing.lg : spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: theme.roundness * 2,
        elevation: 4,
        backgroundColor: theme.colors.background
      }}>
      <TextInput
        mode="outlined"
        onChangeText={text => (textRef.current = text)}
        placeholder={placeholder}
        multiline={false}
        numberOfLines={1}
        style={{
          flex: 1,
          marginLeft: type === "new" ? 0 : spacing.xl,
          marginRight: spacing.sm,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          minHeight: 40
        }}
        contentStyle={{
          fontSize: DimensionHelper.wp(4.2),
          paddingTop: DimensionHelper.hp(1.2)
        }}
        blurOnSubmit={true}
        onSubmitEditing={() => Keyboard.dismiss()}
        value={newMessage?.content}
      />
      <IconButton icon="send" mode="contained" size={24} onPress={() => handleSave(message)} style={{ margin: 0, backgroundColor: theme.colors.primary, borderRadius: theme.roundness }} iconColor={theme.colors.onPrimary} />
    </Surface>
  );

  return (
    <View>
      <View style={{ height: "auto", maxHeight: DimensionHelper.hp(60) }}>
        <FlatList data={conversations} showsVerticalScrollIndicator={false} renderItem={({ item, index }) => renderConversations(item, index)} keyExtractor={item => item.id.toString()} contentContainerStyle={{ padding: spacing.sm }} />
      </View>
      <RenderNewConversation placeholder={"Start Conversation"} type="new" />
    </View>
  );
};

export default ConversationPopup;
