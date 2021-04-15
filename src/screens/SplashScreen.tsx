import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
    };
}

const SplashScreen = (props: Props) => {
    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async() => {
        try {
            const user = await AsyncStorage.getItem('USER_DATA')
            if(user !== null) {
                console.log("USER_DATA-->", user)
                props.navigation.navigate('MainStack');
            } else {
                props.navigation.navigate('AuthStack');
            }
        } catch(e) {
            console.log(e)
        }
    }
    return (
        <View style={styles.mainView}>
            <Image source={Images.splash_screen} style={styles.splashImage} />
        </View>
    );
};

const styles = StyleSheet.create({
    mainView:{
        flex:1, 
        justifyContent:'center', 
        alignItems:'center'
    },
    splashImage:{
        width: wp('100%'),
        height: hp('100%'),
    },
})

export default SplashScreen;
