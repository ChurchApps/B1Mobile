import { DimensionHelper } from "@/helpers/DimensionHelper";
import dayjs from "../../helpers/dayjsConfig";
import React, { useMemo, useCallback } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Constants, globalStyles } from "../../../src/helpers";
import { MessageInterface } from "@churchapps/helpers";
import { PersonHelper } from "../../../src/helpers";
import { Avatar } from "../common/Avatar";

interface NotesInterface {
  message: MessageInterface;
  showEditNote: (noteId: any) => void;
}

const Note = React.memo(({ message, showEditNote }: NotesInterface) => {
  const displayDuration = useMemo(() => dayjs(message?.timeSent).fromNow(), [message?.timeSent]);

  const photoUrl = useMemo(() => (message?.person?.photo && message.person ? PersonHelper.getPhotoUrl(message.person) : null), [message?.person?.photo, message?.person]);

  const handleEditPress = useCallback(() => {
    showEditNote(message.id);
  }, [showEditNote, message.id]);

  return (
    <>
      <View style={[globalStyles.conversationList, { width: DimensionHelper.wp(70) }]}>
        <Avatar size={DimensionHelper.wp(12)} photoUrl={message?.person?.photo} firstName={message?.person?.name?.first} lastName={message?.person?.name?.last} style={globalStyles.memberListIcon} />
        <View style={globalStyles.NoteTextInputView}>
          <View>
            <Text style={globalStyles.name}>{message?.displayName}</Text>
            <Text>{message?.content}</Text>
          </View>
          <TouchableOpacity style={globalStyles.EditIconStyles} onPress={handleEditPress}>
            <Icon name="edit" color={Constants.Colors.app_color} size={DimensionHelper.wp(5)} />
          </TouchableOpacity>
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
      </Text>
    </>
  );
});

export default Note;
