import { Constants } from "@/helpers/Constants";
import { globalStyles } from "@/helpers/GlobalStyles";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  style: any;
}

export function BottomButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity style={{ ...globalStyles.bottomBtn, backgroundColor: title != "NONE" ? Constants.Colors.button_bg : Constants.Colors.button_red, width: style }} onPress={() => onPress()}>
      <Text style={{ ...globalStyles.classesText, fontFamily: title != "NONE" ? Constants.Fonts.RobotoMedium : Constants.Fonts.RobotoRegular }}>{title}</Text>
    </TouchableOpacity>
  );
}
