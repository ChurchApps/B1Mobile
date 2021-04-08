import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
} from 'react-native';
import { FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Images from '../utils/Images';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Icon from 'react-native-vector-icons/Fontisto';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
    };
}

const LoginScreen = (props: Props) => {
    const { navigate } = props.navigation;
    const [loading, setLoading] = useState(false);

    useEffect(() => {

    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerLogoView}>
                    <Image source={Images.logoWhite} style={styles.mainIcon} />
                </View>
            </View>
            <View style={styles.mainView}>
                <Text style={styles.mainText}>Welcome, Please Login.</Text>
                <Text style={styles.textInputTitle}>Email</Text>
                <View style={styles.textInputView}>
                    {/* <Icon name={'email'} color={Colors.app_color} style={styles.inputIcon} size={wp('4.5%')}/> */}
                    <TextInput
                        style={styles.textInputStyle}
                        placeholder={'Email'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='email-address'
                        placeholderTextColor={'lightgray'}
                    />
                </View>
                <Text style={styles.textInputTitle}>Password</Text>
                <View style={styles.textInputView}>
                    {/* <Icon name={'email'} color={Colors.app_color} style={styles.inputIcon} size={wp('4.5%')}/> */}
                    <TextInput
                        style={styles.textInputStyle}
                        placeholder={'Password'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='default'
                        placeholderTextColor={'lightgray'}
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={() => props.navigation.navigate('MainStack')}>
                    {loading ?
                        <ActivityIndicator size='small' color='white' animating={loading} /> :
                        <Text style={styles.loginText}>LOGIN</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.app_color
    },
    mainIcon: {
        width: wp('55%'),
        height: wp('55%'),
        margin: wp('5%'),
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    inputIcon: {
        width: wp('4.5%'),
        height: wp('4.5%'),
        margin: wp('3%'),
    },
    headerContainer: {
        backgroundColor: Colors.gray_bg
    },
    headerLogoView: {
        borderBottomLeftRadius: wp('8%'),
        borderBottomRightRadius: wp('8%'),
        backgroundColor: Colors.app_color,
    },
    mainView: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    mainText: {
        marginHorizontal: wp('5%'),
        marginTop: wp('8%'),
        fontSize: wp('4.8%'),
        fontFamily: Fonts.RobotoMedium
    },
    textInputTitle: {
        marginHorizontal: wp('5%'),
        marginTop: wp('4%'),
        fontSize: wp('3.9%'),
        fontFamily: Fonts.RobotoLight
    },
    textInputView: {
        height: wp('12%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp('3.5%'),
        marginHorizontal: wp('5%'),
        backgroundColor: 'white',
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: wp('1.5%'),
        elevation: 5,
    },
    textInputStyle: {
        height: wp('10%'),
        width: wp('80%'),
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: wp('3.8%'),
        color: 'gray',
    },
    loginButton: {
        height: wp('12%'),
        width: wp('90%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.button_bg,
        marginTop: wp('8%'),
    },
    loginText: {
        color: 'white',
        fontSize: wp('3.8%'),
        fontFamily: Fonts.RobotoMedium
    }
})

export default LoginScreen;

