import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import globalStyles from '../helper/GlobalStyles';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

interface Props {
    title: string;
    onPress: () => void;
}

const BottomButton = (props: Props) => {
    return (
        <TouchableOpacity style={{...globalStyles.bottomBtn,backgroundColor: props.title != 'NONE' ? Colors.button_bg : Colors.button_red}} onPress={() => props.onPress()}>
            <Text style={{...globalStyles.classesText, fontFamily: props.title != 'NONE' ? Fonts.RobotoMedium : Fonts.RobotoRegular}}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

export default BottomButton;