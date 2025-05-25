import { DimensionHelper } from "@churchapps/mobilehelper";
import moment from "moment";
import React from "react";
import { Image, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Constants, MessageInterface, globalStyles } from "@/src/helpers";
import { PersonHelper } from "@/src/helpers/PersonHelper";

interface NotesInterface {
  message: MessageInterface;
  showEditNote: (noteId: any) => void
}

const Note = ({message,showEditNote }: NotesInterface) => {
console.log("message props is ----->", message)
  const displayDuration = moment(message?.timeSent).fromNow();

  return (
    <>
      <View style={[globalStyles.conversationList, { width: DimensionHelper.wp("70%") }]}>
        <Image
          source={
            message?.person?.photo
              ? { uri: PersonHelper.getPhotoUrl(message.person) }
              : Constants.Images.ic_member
          }
          style={[
            globalStyles.memberListIcon,
            { width: DimensionHelper.wp("12%"), height: DimensionHelper.wp("12%"), borderRadius: 8888 },
          ]}
        />
        <View style={globalStyles.NoteTextInputView}>
          <View>
            <Text style={globalStyles.name}>{message?.displayName}</Text>
            <Text>{message?.content}</Text>
          </View>
          <TouchableOpacity style={globalStyles.EditIconStyles} onPress={() => { showEditNote(message.id) }}>
            <Icon name="edit" color={Constants.Colors.app_color} size={DimensionHelper.wp("5%")} />
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
            width: DimensionHelper.wp("100%"),
            left: 72,
            top: -4,
          },
        ]}
      >
        <Text>{displayDuration}</Text>
        {"  "}
      </Text>
    </>
  );
};

export default Note;
