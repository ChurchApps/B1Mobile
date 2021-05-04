import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

interface Props {
    title: string;
    onPress: () => void;
}

const BottomButton = (props: Props) => {
    return (
        <TouchableOpacity style={{...styles.noneBtn,backgroundColor: props.title != 'NONE' ? Colors.button_bg : Colors.button_red}} onPress={() => props.onPress()}>
            <Text style={{...styles.classesText, fontFamily: props.title != 'NONE' ? Fonts.RobotoMedium : Fonts.RobotoRegular}}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    noneBtn: {
        width: wp('100%'),
        height: wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    classesText: {
        color: 'white',
        fontSize: wp('4.2%'),
        marginHorizontal: wp('2.5%'),
        textAlign: 'center'
    },
})

export default BottomButton;