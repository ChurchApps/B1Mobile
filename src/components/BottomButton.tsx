import { globalStyles } from "@/helpers/GlobalStyles";
import { Constants } from "@/helpers/Constants";
import { useThemeColors } from "../theme";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  style: any;
}

export function BottomButton({ title, onPress, style }: Props) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      style={{ ...globalStyles.bottomBtn, backgroundColor: title !== "NONE" ? colors.primary : colors.error, width: style }}
      onPress={() => onPress()}>
      <Text style={{ ...globalStyles.classesText, fontFamily: title !== "NONE" ? Constants.Fonts.RobotoMedium : Constants.Fonts.RobotoRegular }}>{title}</Text>
    </TouchableOpacity>
  );
}
