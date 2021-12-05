import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../helpers';
import { Constants } from '../helpers';

interface Props {
  title: string;
  onPress: () => void;
}

export function BottomButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={{ ...globalStyles.bottomBtn, backgroundColor: title != 'NONE' ? Constants.Colors.button_bg : Constants.Colors.button_red }} onPress={() => onPress()}>
      <Text style={{ ...globalStyles.classesText, fontFamily: title != 'NONE' ? Fonts.RobotoMedium : Fonts.RobotoRegular }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
