import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { globalStyles } from "../helpers";
import { Constants } from "../helpers";

interface Props {
  title: string;
  onPress: () => void;
  style:any
}

export function BottomButton({ title, onPress ,style}: Props) {
  return (
    <TouchableOpacity style={{ ...globalStyles.bottomBtn, backgroundColor: title != "NONE" ? Constants.Colors.button_bg : Constants.Colors.button_red ,width:style}} onPress={() => onPress()}>
      <Text style={{ ...globalStyles.classesText, fontFamily: title != "NONE" ? Constants.Fonts.RobotoMedium : Constants.Fonts.RobotoRegular }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
