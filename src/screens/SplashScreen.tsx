import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { globalStyles } from '../helper';
import Images from '../utils/Images';
import { ApiHelper, ChurchInterface, Userhelper } from "../helper"

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
            const churchString = await AsyncStorage.getItem("CHURCH_DATA")

            if(user !== null && churchString !== null) {
                const church: ChurchInterface = JSON.parse(churchString);
                Userhelper.currentChurch = church;
                church.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
                await Userhelper.setPersonRecord()
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
