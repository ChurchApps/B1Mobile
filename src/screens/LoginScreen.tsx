import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
    Alert,
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
import { getLoginData } from '../redux/actions/loginAction';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
    };
    getLoginApiData: (params: any, callback: any) => void;
}

const LoginScreen = (props: Props) => {
    const { navigate } = props.navigation;
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('test@b1.church');
    const [password, setPassword] = useState('password');

    useEffect(() => {

    }, [])

    const validateDetails = () => {
        if (email != '') {
            let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
            if (emailReg.test(email) === false) {
                Alert.alert("Alert", 'Please enter valid email!!');
                return false;
            } else {
                if (password != '') {
                    return true;
                } else {
                    Alert.alert("Alert", 'Please enter password!!');
                    return false;
                }
            }
        } else {
            Alert.alert("Alert", 'Please enter email!!');
            return false;
        }
    }

    const loginApiCall = () => {
        let params = { "email": email, "password": password }
        setLoading(true);
        props.getLoginApiData(params, async (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                if (res.data.user != null) {
                    await AsyncStorage.setItem('USER_DATA', JSON.stringify(res.data.user))
                    await AsyncStorage.setItem('CHURCH_DATA', JSON.stringify(res.data.churches[0]))
                    .then(() => {
                        props.navigation.navigate('MainStack');
                    })
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerLogoView}>
                    <Image source={Images.logoWhite} style={styles.mainIcon} />
                </View>
            </View>
            <View style={styles.mainView}>
                <Text style={styles.mainText}>Welcome, Please Login.</Text>
                <View style={styles.textInputView}>
                    <Icon name={'email'} color={Colors.app_color} style={styles.inputIcon} size={wp('4.5%')} />
                    <TextInput
                        style={styles.textInputStyle}
                        placeholder={'Email'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='email-address'
                        placeholderTextColor={'lightgray'}
                        value={email}
                        onChangeText={(text) => { setEmail(text) }}
                    />
                </View>
                <View style={styles.textInputView}>
                    <Icon name={'key'} color={Colors.app_color} style={styles.inputIcon} size={wp('4.5%')} />
                    <TextInput
                        style={styles.textInputStyle}
                        placeholder={'Password'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='default'
                        placeholderTextColor={'lightgray'}
                        value={password}
                        onChangeText={(text) => { setPassword(text) }}
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={() => { validateDetails() && loginApiCall()}}>
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
    textInputView: {
        height: wp('12%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: wp('5%'),
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

const mapStateToProps = (state: any) => {
    return {
        login_data: state.login_data
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getLoginApiData: (params: any, callback: any) => dispatch(getLoginData(params, callback))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

