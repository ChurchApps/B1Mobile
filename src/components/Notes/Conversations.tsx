import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApiHelper, ArrayHelper, ConversationInterface } from "../../helpers";
import ConversationPopup from "./ConversationPopup";

interface CustomConversationInterface {
  contentType: string;
  contentId: string;
  groupId: string;
  from : string;
}

const Conversations = ({
  contentType,
  contentId,
  groupId,
  from
}: CustomConversationInterface) => {
  const [conversations, setConversations] = useState<ConversationInterface[]>(
    []
  );

  const loadConversations = async () => {
    const conversations: ConversationInterface[] = contentId
      ? await ApiHelper.get(
          "/conversations/" + contentType + "/" + contentId,
          "MessagingApi"
        )
      : [];
    if (conversations.length > 0) {
      const peopleIds: string[] = [];
      conversations.forEach((c) => {
        c.messages.forEach((m: any) => {
          if (peopleIds.indexOf(m.personId) === -1) peopleIds.push(m.personId);
        });
      });
      const people = await ApiHelper.get(
        "/people/ids?ids=" + peopleIds.join(","),
        "MembershipApi"
      );
      people.reverse();
      conversations.forEach((c) => {
        c.messages.forEach((m: any) => {
          m.person = ArrayHelper.getOne(people, "id", m.personId);
        });
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

export default Conversations;

const styles = StyleSheet.create({});
