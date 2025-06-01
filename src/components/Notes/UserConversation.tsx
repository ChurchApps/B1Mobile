import { MessageInterface } from "@churchapps/mobilehelper";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { ApiHelper, ArrayHelper, ConversationInterface } from "@/src/helpers";
import { AddNote } from "./AddNote";
import Note from "./Note";
import Notes from "./Notes";

interface CustomConversationInterface {
  groupId: string;
  conversation: ConversationInterface;
  conversationId: string;
  createConversation: () => Promise<string>;
  onUpdate: () => void;
}

const UserConversations = ({
  conversation,
  conversationId,
  createConversation,
  onUpdate
}: CustomConversationInterface) => {
  const [conversations, setConversations] = useState<ConversationInterface[]>([]);
  const [editMessageId, setEditMessageId] = React.useState('')
  const [showReplyBox, setShowReplyBox] = useState<number | null>(null);


  const loadConversations = useCallback(async () => {
    let conversations: ConversationInterface[] = [];
    const userMessages: MessageInterface[] = conversation.id
      ? await ApiHelper.get("/messages/conversation/" + conversation.id, "MessagingApi")
      : [];
    if (userMessages.length > 0) {
      const peopleIds: string[] = [];
      userMessages.forEach((message: any) => {
        if (peopleIds.indexOf(message?.personId) === -1) {
          peopleIds.push(message?.personId);
        }
      });
      const people = await ApiHelper.get("/people/basic?ids=" + peopleIds.join(","), "MembershipApi");
      people.reverse();
      const groupedMessages: { [key: string]: MessageInterface[] } = {};
      userMessages.forEach((message: any) => {
        if (!groupedMessages[message?.conversationId]) {
          groupedMessages[message?.conversationId] = [];
        }
        groupedMessages[message.conversationId].push(message);
      });
      conversations = Object.values(groupedMessages).map((messages) => ({
        messages: messages.map((msg) => ({
          ...msg,
          postCount: conversation.postCount,
          person: ArrayHelper.getOne(people, "id", msg.personId)
        }))
      }));
    }
    setConversations(conversations);
    setEditMessageId('');
  }, [conversation]);

  useEffect(() => {
    loadConversations();
  }, [conversation]);

  const renderConversations = (item: any, index: number) => {
    return (
      <View >
        <RenderContent item={item} message={item.messages[0]} idx={index} />
      </View>
    );
  };

  const getNotes = (item: any) => {
    let noteArray: React.ReactNode[] = [];
    for (let i = 1; i < item?.messages?.length; i++)
      noteArray.push(
        <Note
          key={item.messages[i].id}
          message={item.messages[i]}
          showEditNote={setEditMessageId}
        />
      );
    return noteArray;
  };

  const handleReply = (value: number) => setShowReplyBox(value);

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
        <View style={{ marginLeft: 50 }}>
          {getNotes(item)}

        </View>
      </View>
    );
  };

  return (
    <View>
      <View style={{ height: 'auto', maxHeight: DimensionHelper.hp(100) }}>
        <FlatList
          data={conversations}
          renderItem={({ item, index }) => renderConversations(item, index)}
          keyExtractor={(item, index) => item.id}
        />
      </View>
      {conversation && conversation?.messages?.length > 0 ?
        <AddNote type="reply" conversationId={conversation.id} onUpdate={loadConversations} createConversation={async () => (conversation.id)} messageId={editMessageId} />
        :
        <AddNote type="new" conversationId={conversationId} onUpdate={loadConversations} createConversation={createConversation} messageId={editMessageId} />}
    </View>
  )
}
export default UserConversations;
