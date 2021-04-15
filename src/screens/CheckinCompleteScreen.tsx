import React, { useState, useEffect } from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CheckinHeader from '../components/CheckinHeader';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
}

const CheckinCompleteScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;

    useEffect(() => {

    }, [])

    return (
        <View style={styles.container}>
            <CheckinHeader onPress={() => openDrawer()}/>
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
    container: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    safeAreaContainer: {
        justifyContent:'center',
        alignItems:'center',
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
