import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApiHelper, ArrayHelper, ConversationInterface } from "../../../src/helpers";
import { useQuery } from "@tanstack/react-query";
import ConversationPopup from "./ConversationPopup";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface CustomConversationInterface {
  contentType: string;
  contentId: string;
  groupId: string;
  from: string;
}

const Conversations = ({ contentType, contentId, groupId }: CustomConversationInterface) => {
  const [conversations, setConversations] = useState<ConversationInterface[]>([]);
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for conversations
  const { data: rawConversations = [] } = useQuery<ConversationInterface[]>({
    queryKey: [`/conversations/${contentType}/${contentId}`, "MessagingApi"],
    enabled: !!contentId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 0, // Instant stale - conversations are real-time
    gcTime: 3 * 60 * 1000 // 3 minutes
  });

  useEffect(() => {
    if (rawConversations.length > 0) {
      loadConversations();
    }
  }, [rawConversations]);

  const loadConversations = async () => {
    try {
      const conversations: ConversationInterface[] = rawConversations;

      if (conversations.length > 0) {
        const peopleIds: string[] = [];
        const filteredConversations = conversations.filter(conversation => {
          if (!conversation.messages) return false;

          conversation.messages = conversation.messages.filter(message => message !== null);

          if (conversation.messages.length > 0) {
            conversation.messages.forEach((message: any) => {
              if (message.personId && peopleIds.indexOf(message.personId) === -1) {
                peopleIds.push(message.personId);
              }
            });
            return true;
          }
          return false;
        });
        if (peopleIds.length > 0) {
          try {
            const people = await ApiHelper.get("/people/basic?ids=" + peopleIds.join(","), "MembershipApi");

            if (Array.isArray(people)) {
              people.reverse();
              filteredConversations.forEach(conversation => {
                if (conversation.messages) {
                  conversation.messages.forEach((message: any) => {
                    if (message.personId) {
                      const person = ArrayHelper.getOne(people, "id", message.personId);
                      message.person = person || null; // Ensure we don't assign undefined
                    }
                  });
                }
              });
            }
          } catch (peopleError) {
            console.warn("Failed to load people data for conversations:", peopleError);
            // Continue without person data
          }
        }
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };
  useEffect(() => {
    loadConversations();
  }, []);

  const ShowConversationModal = () => (
    <View style={{ marginHorizontal: 8 }}>
      <ConversationPopup conversations={conversations} loadConversations={loadConversations} groupId={groupId} />
    </View>
  );

  return <View>{ShowConversationModal()}</View>;
};

export default Conversations;
