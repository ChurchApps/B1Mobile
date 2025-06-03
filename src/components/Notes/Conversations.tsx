import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApiHelper, ArrayHelper, ConversationInterface } from "@/src/helpers";
import ConversationPopup from "./ConversationPopup";

interface CustomConversationInterface {
  contentType: string;
  contentId: string;
  groupId: string;
  from: string;
}

const Conversations = ({
  contentType,
  contentId,
  groupId,
}: CustomConversationInterface) => {
  const [conversations, setConversations] = useState<ConversationInterface[]>([]);
  const loadConversations = async () => {
    try {
      const conversations: ConversationInterface[] = contentId
        ? await ApiHelper.get(
          "/conversations/" + contentType + "/" + contentId,
          "MessagingApi"
        )
        : [];

      if (conversations.length > 0) {
        const peopleIds: string[] = [];
        const filteredConversations = conversations.filter((conversation) => {
          if (!conversation.messages) return false;

          conversation.messages = conversation.messages.filter(
            (message) => message !== null
          );

          if (conversation.messages.length > 0) {
            conversation.messages.forEach((message: any) => {
              if (
                message.personId &&
                peopleIds.indexOf(message.personId) === -1
              ) {
                peopleIds.push(message.personId);
              }
            });
            return true;
          }
          return false;
        });
        const people = await ApiHelper.get(
          "/people/basic?ids=" + peopleIds.join(","),
          "MembershipApi"
        );
        people.reverse();
        filteredConversations.forEach((conversation) => {
          if (conversation.messages) {
            conversation.messages.forEach((message: any) => {
              if (message.personId) {
                message.person = ArrayHelper.getOne(people, "id", message.personId);
              }
            });
          }
        });
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };
  useEffect(() => {
    loadConversations();
  }, []);


  const ShowConversationModal = () => {
    return (
      <View style={{ marginHorizontal: 8 }}>
        <ConversationPopup
          conversations={conversations}
          loadConversations={loadConversations}
          groupId={groupId}
        />
      </View>
    );
  };

  return <View>{ShowConversationModal()}</View>;
};

export default Conversations;
