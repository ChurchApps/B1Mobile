import {
  Dimensions,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import moment from "moment";
import { Constants,  globalStyles } from "../../helpers";
import { MessageInterface } from "@churchapps/mobilehelper";
import { PersonHelper } from "../../helpers/PersonHelper";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

interface NotesInterface {
  item: any;
  message: MessageInterface;
  idx?: number;
  showReplyBox?: number | null;
  handleReply: (param: any) => void;
}

const Notes = ({
  item,
  message,
  idx,
  showReplyBox,
  handleReply,
}: NotesInterface) => {
  console.log("Message ==", message);

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel(
      (Dimensions.get("screen").width * givenWidth) / 100
    );
  };

  const displayDuration = moment(message?.timeSent).fromNow();
  const isEdited = message.timeUpdated &&
    message.timeUpdated !== message.timeSent && <> • (edited)</>;

  return (
    <>
      <View style={[globalStyles.conversationList, { width: wd("100%") }]}>
        <Image
          source={
            message?.person?.photo
              ? { uri: PersonHelper.getPhotoUrl(message.person) }
              : Constants.Images.ic_member
          }
          style={[
            globalStyles.memberListIcon,
            { width: wp("12%"), height: wp("12%"), borderRadius: 8888 },
          ]}
        />

        <View
          style={{
            backgroundColor: Constants.Colors.gray_bg,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 24,
          }}
        >
          <Text style={styles.name}>{message?.displayName}</Text>
          <Text>{message?.content}</Text>
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
            width: wp("100%"),
            left: 72,
            top: -4,
          },
        ]}
      >
        <Text>{displayDuration}</Text>
        {"  "}
        <Text> {isEdited}</Text>
        {"       "}
        <Text
          style={styles.replyBtn}
          onPress={() =>
            showReplyBox === idx ? handleReply(null) : handleReply(idx)
          }
        >
          {item.postCount &&
            `${item.postCount - 1 === 0 ? "" : item?.postCount - 1} REPLY`}
        </Text>
      </Text>
    </>
  );
};

export default Notes;

const styles = StyleSheet.create({
  name: {
    fontWeight: "bold",
    fontSize: 13,
    lineHeight: 24,
  },
  replyBtn: {
    fontSize: 10,
    fontWeight: "bold",
    color: Constants.Colors.app_color,
  },
});
