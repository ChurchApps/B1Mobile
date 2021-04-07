import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Images from '../utils/Images';
import MainHeader from '../components/MainHeader';
import WebView from 'react-native-webview';
import Loader from '../components/Loader';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    route: {
        params:{
            url: any,
            title: string
        }
    }
}

const HomeScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const { params } = props.route;
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {

    }, [])

    const getTitle = () => {
        const title = params && params.title && params.title;
        return title == undefined ? 'Home' : title;
    }

    return (
        
        <SafeAreaView style={styles.container}>
             <MainHeader
                leftComponent={ <TouchableOpacity onPress={() => openDrawer()}> 
                    <Image source={Images.ic_menu} style={styles.menuIcon}/>
                </TouchableOpacity>}
                mainComponent={<Text style={styles.headerText}>{getTitle()}</Text>}
                rightComponent={null}
            />
            <View style={styles.webViewContainer}> 
                <WebView onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} source={{ uri: params && params.url && params.url }} />
            </View>
            {isLoading && <Loader loading={isLoading}/>}
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
