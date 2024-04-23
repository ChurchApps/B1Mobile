import { MessageInterface } from "@churchapps/mobilehelper";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApiHelper, ArrayHelper, ConversationInterface } from "../../helpers";
import ConversationPopup from "./ConversationPopup";

interface CustomConversationInterface {
  groupId : string;
  conversationId : string;
  messages : MessageInterface;
  from : string;

}

const UserConversations = ({

  conversationId, 
  groupId,
  messages,
  from
}: CustomConversationInterface) => {
  const [conversations, setConversations] = useState<ConversationInterface[]>(
    []
  );
 

  const loadConversations = async () => {
    let conversations: ConversationInterface[] = [];
    const userMessages: MessageInterface[] = messages
        ? await ApiHelper.get("/messages/conversation/" + conversationId, "MessagingApi")
        : [];
    if (userMessages.length > 0) {
        const peopleIds: string[] = [];
        userMessages.forEach((message : any) => {
            if (peopleIds.indexOf(message?.personId) === -1) {
                peopleIds.push(message?.personId);
            }
        });
        const people = await ApiHelper.get(
            "/people/ids?ids=" + peopleIds.join(","),
            "MembershipApi"
        );

        people.reverse();
        conversations = userMessages.map((message) => {
            const person = ArrayHelper.getOne(people, "id", message.personId);
            return {
                ...message,
                ...person,
                messages: userMessages.filter((msg) => msg.conversationId === message.conversationId).map((msg) => ({
                  ...msg,
                  person: ArrayHelper.getOne(people, "id", msg.personId) 
              }))
               
            };
        });
    }
    setConversations(conversations);
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
          from={from}
        />
      </View>
    );
  };

  return <View>{ShowConversationModal()}</View>;
};

export default UserConversations;

const styles = StyleSheet.create({});
