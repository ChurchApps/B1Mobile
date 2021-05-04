import React from 'react';
import { Image, NativeModules, Platform, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import Images from '../utils/Images';
const { StatusBarManager } = NativeModules;

interface Props {
    onPress: () => void;
}

const WhiteHeader = (props: Props) => {
    return (
        <View style={styles.headerLogoView}>
            <Image source={Images.logoBlue} style={styles.mainIcon} />
            <TouchableOpacity onPress={() => props.onPress()} style={styles.menuBtn}>
                <Image source={Images.ic_menu} style={styles.menuIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerLogoView: {
        borderBottomLeftRadius: wp('8%'),
        borderBottomRightRadius: wp('8%'),
        backgroundColor: 'white',
        shadowColor: Colors.app_color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: wp('1.5%'),
        elevation: 5,
    },
    menuIcon: {
        width: wp('6%'),
        height: wp('6%'),
        marginLeft: wp('5%'),
        marginTop: Platform.OS == 'ios' ? StatusBarManager.HEIGHT + wp('5%') : wp('5%')
    },
    mainIcon: {
        width: wp('55%'),
        height: wp('55%'),
        marginTop: wp('10%'),
        marginBottom: wp('4%'),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    menuBtn: {
        position: 'absolute'
    }
})

export default WhiteHeader;