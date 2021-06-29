import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../utils/Colors';
import Icon from 'react-native-vector-icons/Fontisto';
import { getLoginData } from '../redux/actions/loginAction';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../helper/GlobalStyles';
import BlueHeader from '../components/BlueHeader';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
    };
    getLoginApiData: (params: any, callback: any) => void;
}

const LoginScreen = (props: Props) => {
    const { navigate } = props.navigation;
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('rdavis@chums.org');
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
        <SafeAreaView style={globalStyles.appContainer}>
            <BlueHeader />
            <View style={globalStyles.grayContainer}>
                <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
                <View style={globalStyles.textInputView}>
                    <Icon name={'email'} color={Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
                    <TextInput
                        style={globalStyles.textInputStyle}
                        placeholder={'Email'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='email-address'
                        placeholderTextColor={'lightgray'}
                        value={email}
                        onChangeText={(text) => { setEmail(text) }}
                    />
                </View>
                <View style={globalStyles.textInputView}>
                    <Icon name={'key'} color={Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
                    <TextInput
                        style={globalStyles.textInputStyle}
                        placeholder={'Password'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType='default'
                        placeholderTextColor={'lightgray'}
                        secureTextEntry={true}
                        value={password}
                        onChangeText={(text) => { setPassword(text) }}
                    />
                </View>

                <TouchableOpacity style={globalStyles.roundBlueButton} onPress={() => { validateDetails() && loginApiCall()}}>
                    {loading ?
                        <ActivityIndicator size='small' color='white' animating={loading} /> :
                        <Text style={globalStyles.roundBlueButtonText}>LOGIN</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

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

