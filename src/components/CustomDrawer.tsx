import React, { useState, useEffect, useReducer } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    ActivityIndicator,
    DevSettings
} from 'react-native';
import { StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { ScrollView } from 'react-native-gesture-handler';
import MainHeader from './MainHeader';
import Images from '../utils/Images';
import Fonts from '../utils/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect, useSelector } from 'react-redux';
import { getDrawerList } from '../redux/actions/drawerItemsAction';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getMemberData } from '../redux/actions/memberDataAction';
import { getToken } from '../helper/ApiHelper';
import { IMAGE_URL } from '../helper/ApiConstants';
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
    const [user, setUser] = useState({ displayName: '' });
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
        const token = await getToken('default')
        const user = await AsyncStorage.getItem('USER_DATA')
        if (token !== null && user !== null) {
            const userId = JSON.parse(user).id
            props.getMemberDataApi(userId, token, (err: any, res: any) => {
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
            <TouchableOpacity style={styles.headerView} onPress={() => navigateToScreen(item)}>
                {topItem ? <Image source={item.image} style={styles.tabIcon} /> :
                    <Icon name={tab_icon} color={'black'} style={styles.tabIcon} size={wp('6%')} />}
                <Text style={styles.tabTitle}>{item.text}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView>
            <View style={styles.headerView}>
                <Image source={{ uri: IMAGE_URL + userProfile }} style={styles.userIcon} />
                <Text style={styles.userNameText}>{user != null ? user.displayName : ''}</Text>
            </View>
            <FlatList data={menuList} renderItem={({ item }) => listItem(true, item)} keyExtractor={(item: any) => item.id} />

            <TouchableOpacity style={styles.churchContainer} onPress={() => navigate('ChurchSearch', {})}>
                {churchEmpty && <Image source={Images.ic_search} style={globalStyles.searchIcon} />}
                <Text style={{ ...styles.churchText, color: churchEmpty ? 'gray' : 'black' }}>
                    {churchEmpty ? 'Find your church...' : churchName}
                </Text>
            </TouchableOpacity>

            {
                loading ? <ActivityIndicator size='small' color='gray' animating={loading} /> :
                    <FlatList data={drawerList} renderItem={({ item }) => listItem(false, item)} keyExtractor={(item: any) => item.id} />
            }
            <TouchableOpacity style={styles.logoutBtn} onPress={() => logoutAction()}>
                <Text>Log out</Text>
            </TouchableOpacity>
        </SafeAreaView>

    );
};


const styles = StyleSheet.create({
    userIcon: {
        width: wp('10%'),
        height: wp('10%'),
        margin: wp('4%'),
        borderRadius: wp('5%')
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    userNameText: {
        fontSize: wp('3.8%'),
        fontFamily: Fonts.RobotoRegular
    },
    tabIcon: {
        width: wp('6%'),
        height: wp('6%'),
        marginVertical: wp('2%'),
        marginHorizontal: wp('4%'),
    },
    tabTitle: {
        fontSize: wp('4%'),
        fontFamily: Fonts.RobotoRegular
    },
    churchContainer: {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        marginHorizontal: wp('4%'),
        marginTop: wp('6%'),
        marginBottom: wp('2%'),
        borderRadius: wp('1.5%'),
        flexDirection: 'row',
        alignItems: 'center'
    },
    churchText: {
        fontSize: wp('3.7%'),
        paddingVertical: wp('1.5%'),
        fontFamily: Fonts.RobotoRegular,
        marginHorizontal: wp('1%'),
    },
    logoutBtn: {
        marginTop: wp('10%'),
        marginLeft: wp('5%')
    }
})

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