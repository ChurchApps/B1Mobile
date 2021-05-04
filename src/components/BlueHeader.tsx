import React from 'react';
import { Image, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import Images from '../utils/Images';

const BlueHeader = (props: {}) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerLogoView}>
                <Image source={Images.logoWhite} style={styles.mainIcon} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Colors.gray_bg
    },
    headerLogoView: {
        borderBottomLeftRadius: wp('8%'),
        borderBottomRightRadius: wp('8%'),
        backgroundColor: Colors.app_color,
    },
    mainIcon: {
        width: wp('55%'),
        height: wp('55%'),
        margin: wp('5%'),
        resizeMode: 'contain',
        alignSelf: 'center'
    },
})

export default BlueHeader;