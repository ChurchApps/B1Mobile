import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, DevSettings } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Images from '../utils/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { getDrawerList } from '../redux/actions/drawerItemsAction';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getMemberData } from '../redux/actions/memberDataAction';
import { getToken } from '../helper/ApiHelper';
import API from '../helper/ApiConstants';
import globalStyles from '../helper/GlobalStyles';

// interface Props {
//     navigation: {
//         navigate: (screenName: string, params: any) => void;
//         goBack: () => void;
//         openDrawer: () => void;
//     };
//     onPress: () => void;
//     getDrawerItemList: (churchId: String, callback: any) => void;
// }

const CustomDrawer = (props: any) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [churchName, setChurchName] = useState('');
    const [churchEmpty, setChurchEmpty] = useState(true);
    const [drawerList, setDrawerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState('');

    const menuList = [{
        id: 1,
        text: 'Bible',
        image: Images.ic_bible,
        url: 'https://biblegateway.com/'
    }, {
        id: 2,
        text: 'Preferences',
        image: Images.ic_preferences
    }, {
        id: 3,
        text: 'Members',
        image: Images.ic_groups
    }];

    useEffect(() => {
        getChurch();
    }, [props.navigation])

    const getChurch = async () => {
        try {
            const user = await AsyncStorage.getItem('USER_DATA')
            if (user !== null) { setUser(JSON.parse(user)) }
            const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
            if (churchvalue !== null) {
                const churchData = JSON.parse(churchvalue);
                setChurchName(churchData.name)
                setChurchEmpty(false)
                getDrawerList(churchData.id);
                getMemberData();
            }

        } catch (e) {
            console.log(e)
        }
    }

    const navigateToScreen = (item: any) => {
        if (item.linkType && item.linkType == "checkin") {
            navigate('ServiceScreen', {})
        } else {
            if (item.url && item.url != '') {
                navigate('HomeScreen', { url: item.url, title: item.text })
            }
            if (item.text == 'Members') {
                navigate('MembersSearch')
            }
        }
    }

    const getDrawerList = (churchId: any) => {
        setLoading(true);
        props.getDrawerItemList(churchId, (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                if (res.data.length != 0) {
                    res.data.forEach((item: any) => {
                        if (item.text == 'Home') {
                            navigateToScreen(item)
                        }
                    })
                    setDrawerList(res.data)
                } else {
                    setDrawerList([])
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const getMemberData = async () => {
        const token = await getToken('MembershipApi')
        const church = await AsyncStorage.getItem('CHURCH_DATA')
        if (token !== null && church !== null) {
            const personId = JSON.parse(church).personId
            props.getMemberDataApi(personId, token, (err: any, res: any) => {
                if (!err) {
                    if (res.data) {
                        setUserProfile(res.data.photo)
                    }
                } else {
                    Alert.alert("Alert", err.message);
                }
            });
        }
    }

    const logoutAction = async () => {
        await AsyncStorage.getAllKeys()
            .then(keys => AsyncStorage.multiRemove(keys))
            .then(() => DevSettings.reload());
    }

    const listItem = (topItem: boolean, item: any) => {
        var tab_icon = item.icon != undefined ? item.icon.slice(7) : '';
        return (
            <TouchableOpacity style={globalStyles.headerView} onPress={() => navigateToScreen(item)}>
                {topItem ? <Image source={item.image} style={globalStyles.tabIcon} /> :
                    <Icon name={tab_icon} color={'black'} style={globalStyles.tabIcon} size={wp('6%')} />}
                <Text style={globalStyles.tabTitle}>{item.text}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView>
            <View style={globalStyles.headerView}>
                <Image source={{ uri: API.IMAGE_URL + userProfile }} style={globalStyles.userIcon} />
                <Text style={globalStyles.userNameText}>{user != null ? `${user.firstName} ${user.lastName}` : ''}</Text>
            </View>
            <FlatList data={menuList} renderItem={({ item }) => listItem(true, item)} keyExtractor={(item: any) => item.id} />

            <TouchableOpacity style={globalStyles.churchBtn} onPress={() => navigate('ChurchSearch', {})}>
                {churchEmpty && <Image source={Images.ic_search} style={globalStyles.searchIcon} />}
                <Text style={{ ...globalStyles.churchText, color: churchEmpty ? 'gray' : 'black' }}>
                    {churchEmpty ? 'Find your church...' : churchName}
                </Text>
            </TouchableOpacity>

            {
                loading ? <ActivityIndicator size='small' color='gray' animating={loading} /> :
                    <FlatList data={drawerList} renderItem={({ item }) => listItem(false, item)} keyExtractor={(item: any) => item.id} />
            }
            <TouchableOpacity style={globalStyles.logoutBtn} onPress={() => logoutAction()}>
                <Text>Log out</Text>
            </TouchableOpacity>
        </SafeAreaView>

    );
};

const mapStateToProps = (state: any) => {
    return {
        drawerlist: state.drawerlist,
        login_data: state.login_data,
        member_data: state.member_data,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getDrawerItemList: (churchId: any, callback: any) => dispatch(getDrawerList(churchId, callback)),
        getMemberDataApi: (userId: any, token: any, callback: any) => dispatch(getMemberData(userId, token, callback)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomDrawer);