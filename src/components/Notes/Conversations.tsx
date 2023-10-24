import { Dimensions, PixelRatio, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { ArrayHelper,  } from "../../helpers";
import { ApiHelper, ConversationInterface } from "@churchapps/mobilehelper";
import ConversationPopup from "./ConversationPopup";

interface CustomConversationInterface {
  contentType: string;
  contentId: string;
  groupId: string;
}

const Conversations = ({
  contentType,
  contentId,
  groupId,
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

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel(
      (Dimensions.get("screen").width * givenWidth) / 100
    );
  };

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

const styles = StyleSheet.create({});
