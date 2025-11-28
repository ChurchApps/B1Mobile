import { ConversationInterface } from "../../helpers/Interfaces";
import dayjs from "dayjs";
import React, { useMemo, useCallback } from "react";
import { Text, View } from "react-native";
import { ApiHelper, globalStyles } from "../../../src/helpers";
import { TimelinePostInterface } from "../../../src/helpers/Interfaces";
import UserConversations from "../Notes/UserConversation";
import { Menu, IconButton } from "react-native-paper";
import { OptimizedImage } from "../OptimizedImage";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface Props {
  item: { item: TimelinePostInterface; index: number };
  index?: number;
  onUpdate: () => void;
}

const TimeLinePost = React.memo(({ item, onUpdate }: Props) => {
  const currentUserChurch = useCurrentUserChurch();

  const dateCalculations = useMemo(() => {
    const date = item?.item?.data?.start;
    const TodayDate = dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    const startDate = dayjs(item?.item?.timeSent);
    const endDate = item?.item?.postType == "event" || item?.item?.postType == "group" ? dayjs(TodayDate) : dayjs(item?.item?.data?.end);
    const timeDifference = endDate.diff(startDate, "hours");
    const MinDifference = endDate.diff(startDate, "minute");
    const dayDiff = endDate.diff(startDate, "days");
    const formattedDate = dayjs(date).format("MMM D, YYYY h:mm A");

    return {
      date,
      TodayDate,
      startDate,
      endDate,
      timeDifference,
      MinDifference,
      dayDiff,
      formattedDate
    };
  }, [item?.item?.data?.start, item?.item?.timeSent, item?.item?.postType, item?.item?.data?.end]);

  const { timeDifference, MinDifference, dayDiff, formattedDate } = dateCalculations;

  const createConversation = useCallback(async () => {
    const conv: ConversationInterface = {
      groupId: item?.item?.data?.groupId,
      churchId: currentUserChurch?.church?.id,
      contentType: item?.item?.postType,
      contentId: item?.item?.postId,
      title: item?.item?.postType + " #" + item?.item?.postId + " Conversation",
      messages: []
    };
    const result = await ApiHelper.post("/conversations", [conv], "MessagingApi");
    item?.item?.conversation;
    const cId = result[0].id;
    return cId;
  }, [item?.item?.data?.groupId, currentUserChurch?.church?.id, item?.item?.postType, item?.item?.postId]);

  const [showMenu, setShowMenu] = React.useState(false);

  const handleEdit = useCallback(() => {
    // Implement edit functionality
  }, []);

  const handleDelete = useCallback(() => {
    // Implement delete functionality
  }, []);

  const title = item?.item?.postType == "event" || item?.item?.postType == "group" || item?.item?.postType == "sermon" || item?.item?.postType == "venue" ? item?.item?.name : item?.item?.groupName;
  return (
    <View style={globalStyles.FlatlistViewStyle} key={item.index}>
      {title && (
        <View style={globalStyles.TitleStyle}>
          <Text style={globalStyles.TitleTextStyle}>{title}</Text>
        </View>
      )}

      {(item?.item?.postType == "event" && item?.item?.photoUrl !== null) || item?.item?.postType == "sermon" || item?.item?.postType == "group" || (item?.item?.postType == "venue" && item?.item?.data?.image != null) ? (
        <View style={globalStyles.ImageMainView}>
          <View style={globalStyles.ImageView}>{item?.item?.postType == "venue" && item?.item?.data?.image != null ? <OptimizedImage source={{ uri: item?.item?.data?.image }} style={globalStyles.groupImageStyle} contentFit="contain" /> : item?.item?.postType == "sermon" ? <OptimizedImage source={{ uri: item?.item?.data?.thumbnail }} style={globalStyles.groupImageStyle} contentFit="cover" /> : <OptimizedImage source={{ uri: item?.item?.photoUrl }} style={globalStyles.groupImageStyle} contentFit="cover" />}</View>
        </View>
      ) : null}

      {item?.item?.postType == "event" || item?.item?.postType == "task" || item?.item?.postType == "venue" ? (
        <View style={globalStyles.postTitleView}>
          <View style={globalStyles.mainTitleView}>
            <Text>
              <Text style={globalStyles.eventTextStyle}>{item?.item?.postType == "event" ? "Event:" : item?.item?.postType == "task" ? "Task:" : null}</Text>
              {item?.item?.postType == "venue" ? (
                <Text>
                  <Text style={globalStyles.eventTextStyle}> {item?.item?.data?.studyName ?? ""}</Text>
                  <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}> {item?.item?.data?.name ?? ""}</Text>
                </Text>
              ) : (
                <Text style={globalStyles.eventTextStyle}> {item?.item?.data?.title ?? ""}</Text>
              )}

              {item?.item?.postType == "event" ? <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> - {formattedDate ?? ""}</Text> : null}
            </Text>
          </View>
          <View>
            <Text style={[globalStyles.eventTextStyle, { textAlign: "right" }]}>{timeDifference >= 24 ? `${dayDiff}d` : timeDifference >= 1 ? `${timeDifference}h` : `${MinDifference}m`}</Text>
          </View>
        </View>
      ) : item?.item?.postType == "group" ? (
        <View style={globalStyles.postTitleView}>
          <View style={globalStyles.TitleView}>
            <View style={globalStyles.mainTitleView}>
              <Text>
                <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}>Conversation for the</Text>
                <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}> {item?.item?.name}</Text>
                <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> group</Text>
              </Text>
            </View>
            <Text style={[globalStyles.eventTextStyle, { textAlign: "right" }]}>{timeDifference >= 24 ? `${dayDiff}d` : timeDifference >= 1 ? `${timeDifference}h` : `${MinDifference}m`}</Text>
          </View>
        </View>
      ) : item?.item?.postType == "sermon" ? (
        <View style={globalStyles.postTitleView}>
          <View style={globalStyles.mainTitleView}>
            <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.title ?? item?.item?.data?.title}</Text>
          </View>
          <View>
            <Text style={[globalStyles.eventTextStyle, { textAlign: "right" }]}>{timeDifference >= 24 ? `${dayDiff}d` : `${timeDifference}h`}</Text>
          </View>
        </View>
      ) : null}
      {item?.item?.postType == "task" ? (
        <View style={globalStyles.PostTitleViewStyle}>
          <Text>
            <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.createdByLabel}</Text>
            <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> has requested this from </Text>
            <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.assignedToLabel}</Text>
            <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> on behalf of </Text>
            <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.associatedWithLabel}</Text>
          </Text>
        </View>
      ) : null}

      {item?.item?.postType == "sermon" || item?.item?.postType == "event" || (item?.item?.postType == "venue" && item?.item?.data?.description != null) ? (
        <View style={globalStyles.PostTitleViewStyle}>
          <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor, item?.item?.postType == "sermon" || item?.item?.postType == "venue" ? globalStyles.tabTextColor : null]}>{item?.item?.data?.description}</Text>
        </View>
      ) : null}
      <UserConversations conversationId={item?.item?.conversation?.id} groupId={item?.item?.conversation?.groupId} key={item?.item?.conversation?.id} conversation={item?.item?.conversation} createConversation={createConversation} onUpdate={onUpdate} />

      {showMenu && (
        <Menu visible={showMenu} onDismiss={() => setShowMenu(false)} anchor={<IconButton icon="dots-vertical" onPress={() => setShowMenu(true)} style={{ margin: 0 }} />}>
          <Menu.Item
            onPress={() => {
              setShowMenu(false);
              handleEdit();
            }}
            title="Edit"
          />
          <Menu.Item
            onPress={() => {
              setShowMenu(false);
              handleDelete();
            }}
            title="Delete"
          />
        </Menu>
      )}
    </View>
  );
});
export default TimeLinePost;
