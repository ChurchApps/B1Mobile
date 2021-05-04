import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import WhiteHeader from '../components/WhiteHeader';
import globalStyles from '../helper/GlobalStyles';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
        addListener: (type: string, callback: any) => void;
    };
}

const CheckinCompleteScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;

    useEffect(() => {
        serviceNavigate();
    }, []);

    useEffect(() => {
        serviceNavigate();
        const init = props.navigation.addListener('focus', async () => { serviceNavigate() });
        return init;
    }, [props.navigation]);

    const serviceNavigate = () => {
        setTimeout(() => { navigate('ServiceScreen') }, 1000);
    }

    return (
        <View style={globalStyles.grayContainer}>
            <WhiteHeader onPress={() => openDrawer()} />
            <SafeAreaView style={styles.safeAreaContainer}>
                <Icon name={'check-circle'} style={styles.successIcon} size={wp('20%')} />
                <Text style={styles.successText}>
                    Checkin Complete.
                </Text>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeAreaContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    successIcon: {
        fontSize: wp('20%'),
        color: Colors.button_green,
    },
    successText: {
        fontFamily: Fonts.RobotoLight,
        fontSize: wp('5%'),
        color: 'black',
        marginVertical: wp('5%'),
    }
})

export default CheckinCompleteScreen;
