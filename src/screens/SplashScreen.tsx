import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import globalStyles from '../helper/GlobalStyles';
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
                props.navigation.navigate('MainStack');
            } else {
                props.navigation.navigate('AuthStack');
            }
        } catch(e) {
            console.log(e)
        }
    }
    return (
        <View style={globalStyles.safeAreaContainer}>
            <Image source={Images.splash_screen} style={globalStyles.splashImage} />
        </View>
    );
};

export default SplashScreen;
