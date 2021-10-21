import * as React from 'react';
import { Image, NativeModules, Platform, TouchableOpacity, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Images from '../utils/Images';
import globalStyles from '../helper/GlobalStyles';
const { StatusBarManager } = NativeModules;

interface Props {
    onPress: () => void;
}

export function WhiteHeader({ onPress }: Props) {
    return (
        <View style={globalStyles.headerLogoView}>
            <Image source={Images.logoBlue} style={globalStyles.whiteMainIcon} />
            <TouchableOpacity onPress={() => onPress()} style={globalStyles.logoMenuBtn}>
                <Image source={Images.ic_menu} style={{...globalStyles.logoMenuIcon, marginTop: Platform.OS == 'ios' ? StatusBarManager.HEIGHT + wp('5%') : wp('5%')}} />
            </TouchableOpacity>
        </View>
    );
};
