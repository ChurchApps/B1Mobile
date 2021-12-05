import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../helpers';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

interface Props {
  title: string;
  onPress: () => void;
}

export function BottomButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={{ ...globalStyles.bottomBtn, backgroundColor: title != 'NONE' ? Colors.button_bg : Colors.button_red }} onPress={() => onPress()}>
      <Text style={{ ...globalStyles.classesText, fontFamily: title != 'NONE' ? Fonts.RobotoMedium : Fonts.RobotoRegular }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
