import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Image, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Images from '../utils/Images';
import MainHeader from '../components/MainHeader';
import WebView from 'react-native-webview';
import Loader from '../components/Loader';
import globalStyles from '../helper/GlobalStyles';

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
    };
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
        
        <SafeAreaView style={globalStyles.homeContainer}>
             <MainHeader
                leftComponent={ <TouchableOpacity onPress={() => openDrawer()}> 
                    <Image source={Images.ic_menu} style={globalStyles.menuIcon}/>
                </TouchableOpacity>}
                mainComponent={<Text style={globalStyles.headerText}>{getTitle()}</Text>}
                rightComponent={null}
            />
            <View style={globalStyles.webViewContainer}> 
                <WebView onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} source={{ uri: params && params.url && params.url }} scalesPageToFit={false} />
            </View>
            {isLoading && <Loader loading={isLoading}/>}
        </SafeAreaView>
    );
};

export default HomeScreen;
