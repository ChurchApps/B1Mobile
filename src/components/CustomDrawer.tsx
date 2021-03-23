import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList
} from 'react-native';
import { StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { ScrollView } from 'react-native-gesture-handler';
import MainHeader from './MainHeader';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    onPress: () => void;
}

const CustomDrawer = (props: any) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const menuList = [{
        id: 1,
        title: 'Bible',
        image: Images.ic_bible,
        url: 'https://biblegateway.com/'
    },{
        id: 2,
        title: 'Preferences',
        image: Images.ic_preferences
    }];
    const staticTabs = [{
        id: 1,
        title: 'Home',
        image: Images.ic_home
    },{
        id: 2,
        title: 'Live Stream',
        image: Images.ic_live_stream
    },{
        id: 3,
        title: 'Checkin',
        image: Images.ic_checkin
    },{
        id: 4,
        title: 'Give',
        image: Images.ic_give
    },{
        id: 5,
        title: 'Groups',
        image: Images.ic_groups
    },{
        id: 6,
        title: 'Get in Touch',
        image: Images.ic_getintouch
    }]

    useEffect(() => {
    }, [])

    return (
        <SafeAreaView>
            <View style={styles.headerView}>
                <Image source={Images.ic_user} style={styles.userIcon}/>
                <Text style={styles.userNameText}>Jeremy Zongker</Text>
            </View>
            <FlatList
                data={menuList}
                renderItem={({ item }) =>
                <TouchableOpacity style={styles.headerView}>
                    <Image source={item.image} style={styles.tabIcon}/>
                    <Text style={styles.tabTitle}>{item.title}</Text>
                </TouchableOpacity>}
                keyExtractor={( item: any ) => item.id}
            />
            <View style={styles.churchContainer}>
                <Text style={styles.churchText}>Cedar Ridge Online</Text>
            </View>
            <FlatList
                data={staticTabs}
                renderItem={({ item }) =>
                <View style={styles.headerView}>
                    <Image source={item.image} style={styles.tabIcon}/>
                    <Text style={styles.tabTitle}>{item.title}</Text>
                </View>}
                keyExtractor={( item: any ) => item.id}
            />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    userIcon: {
        width: wp('10%'),
        height: wp('10%'),
        margin: wp('4%'),
        borderRadius: wp('4%')
    },
    headerView: {
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems: 'center'
    },
    userNameText: {
        fontSize: wp('3.8%'),
    },
    tabIcon: {
        width: wp('6%'),
        height: wp('6%'),
        marginVertical: wp('2%'),
        marginHorizontal: wp('4%'),
    },
    tabTitle: {
        fontSize: wp('4%'),
    },
    churchContainer: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginHorizontal: wp('4%'),
        marginTop: wp('6%'),
        marginBottom: wp('2%')
    },
    churchText: {
        fontSize: wp('4.2%'),
        paddingVertical: wp('1.5%')
    }
})

export default CustomDrawer;
