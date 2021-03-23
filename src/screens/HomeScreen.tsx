import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Images from '../utils/Images';
import MainHeader from '../components/MainHeader';
import WebView from 'react-native-webview';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
}

const HomeScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    useEffect(() => {

    }, [])

    return (
        <SafeAreaView style={styles.container}>
             <MainHeader
                leftComponent={ <TouchableOpacity onPress={() => openDrawer()}> 
                    <Image source={Images.ic_menu} style={styles.menuIcon}/>
                </TouchableOpacity>}
                mainComponent={<Text style={styles.headerText}>Home</Text>}
                rightComponent={null}
            />
            <View style={styles.webViewContainer}> 
                <WebView source={{ uri: 'https://biblegateway.com/'}} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:1, 
        backgroundColor: 'white'
    },
    menuIcon: {
        width: wp('6%'),
        height: wp('6%'),
        margin: wp('5%'),
        tintColor: 'white'
    },
    headerText: {
        color: 'white', 
        textAlign:'center',
        fontSize: wp('4.5%'),
        fontWeight: 'bold'
    },
    webViewContainer: {
        flex: 1,
        height: hp('100%'),
        width: wp('100%')
    }
})

export default HomeScreen;
