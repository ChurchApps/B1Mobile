import { DimensionHelper } from "@/helpers/DimensionHelper";
import moment from "moment";
import React from "react";
import { Image, Text, View } from "react-native";
import { Constants, globalStyles } from "../../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import { PersonHelper } from "../../../src/helpers/PersonHelper";

interface NotesInterface {
  item: any;
  message: MessageInterface;
  idx?: number;
  showReplyBox?: number | null;
  handleReply: (param: any) => void;
}

const Notes = ({ item, message, idx, showReplyBox, handleReply }: NotesInterface) => {
  //console.log("Message ==", message);

  const displayDuration = moment(message?.timeSent).fromNow();
  const isEdited = message.timeUpdated && message.timeUpdated !== message.timeSent && <> • (edited)</>;

  return (
    <>
      <View style={[globalStyles.conversationList, { width: DimensionHelper.wp(70), marginLeft: DimensionHelper.wp(2) }]}>
        <Image
          source={message?.person?.photo ? { uri: PersonHelper.getPhotoUrl(message.person) } : Constants.Images.ic_member}
          style={[globalStyles.memberListIcon, { width: DimensionHelper.wp(12), height: DimensionHelper.wp(12), borderRadius: 8888 }]}
        />

        <View style={globalStyles.NoteTextInputView}>
          <View>
            <Text style={globalStyles.name}>{message?.displayName}</Text>
            <Text>{message?.content}</Text>
          </View>
        </View>
      </View>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          globalStyles.textInputStyle,
          {
            paddingTop: 0,
            height: 24,
            fontSize: 11,
            width: DimensionHelper.wp(100),
            left: 72,
            top: -4
          }
        ]}>
        <Text>{displayDuration}</Text>
        {"  "}
        <Text> {isEdited}</Text>
        {"       "}
        <Text style={globalStyles.replyBtn} onPress={() => (showReplyBox === idx ? handleReply(null) : handleReply(idx))}>
          {item.postCount && `${item.postCount - 1 === 0 ? "" : item?.postCount - 1} REPLY`}
        </Text>
      </Text>
    </>
  );
};

export default Notes;
