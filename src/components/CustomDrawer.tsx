import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    ActivityIndicator
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
import { connect } from 'react-redux';
import { getDrawerList } from '../redux/actions/drawerItemsAction';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    onPress: () => void;
    getDrawerItemList: (callback: any) => void;
}

const CustomDrawer = (props: any) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [churchName, setChurchName] = useState('');
    const [churchEmpty, setChurchEmpty] = useState(true);
    const [drawerList, setDrawerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const menuList = [{
        id: 1,
        text: 'Bible',
        image: Images.ic_bible,
        url: 'https://biblegateway.com/'
    },{
        id: 2,
        text: 'Preferences',
        image: Images.ic_preferences
    }];

    useEffect(() => {
        getChurch();
        
    }, [])

    const getChurch = async () => {
        try {
            const value = await AsyncStorage.getItem('CHURCH_DATA')
            if(value !== null) {
                const churchData = JSON.parse(value);
                setChurchName(churchData.name)
                setChurchEmpty(false)
                getDrawerList(churchData.id);
            }
        } catch(e) {
            console.log(e)
        }
    }

    const navigateToScreen = (item : any) => {
        if (item.url && item.url != '') {
            navigate('HomeScreen',{ url:item.url, title: item.text })
        }
    }

    const getDrawerList = (churchId: any) => {
        setLoading(true);
        props.getDrawerItemList(churchId, (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                if (res.data.length != 0) {
                    setDrawerList(res.data)
                } else {
                    setDrawerList([])
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const listItem = (topItem: boolean,item: any) => {
        var tab_icon = item.icon != undefined ? item.icon.replace('fas fa-','') : '';
        return (
            <TouchableOpacity style={styles.headerView} onPress={() => navigateToScreen(item)}>
                {topItem ? <Image source={item.image} style={styles.tabIcon}/> : 
                <Icon name={tab_icon} color={'black'} style={styles.tabIcon} size={wp('6%')}/>}
                <Text style={styles.tabTitle}>{item.text}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView>
            <View style={styles.headerView}>
                <Image source={Images.ic_user} style={styles.userIcon}/>
                <Text style={styles.userNameText}>Jeremy Zongker</Text>
            </View>
            <FlatList data={menuList} renderItem={({ item }) => listItem(true, item)} keyExtractor={( item: any ) => item.id} />

            <TouchableOpacity style={styles.churchContainer} onPress={() => navigate('ChurchSearch')}>
                {churchEmpty && <Image source={Images.ic_search} style={styles.searchIcon} />}
                <Text style={{...styles.churchText, color: churchEmpty ? 'gray' : 'black'}}>
                    {churchEmpty ? 'Find your church...' : churchName}
                </Text>
            </TouchableOpacity>
            
            {
                loading ? <ActivityIndicator size='small' color='gray' animating={loading} /> :
                <FlatList data={drawerList} renderItem={({ item }) => listItem(false, item)} keyExtractor={( item: any ) => item.id} />
            }
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
        alignItems:'center'
    },
    churchText: {
        fontSize: wp('3.7%'),
        paddingVertical: wp('1.5%'),
        fontFamily: Fonts.RobotoRegular,
        marginHorizontal: wp('1%'),
    },
    searchIcon: {
        width: wp('6%'),
        height: wp('6%'), 
        margin: wp('1.5%'),
    }
})

const mapStateToProps = (state: any) => {
    return {
        drawerlist: state.drawerlist,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getDrawerItemList: (churchId: any, callback: any) => dispatch(getDrawerList(churchId, callback))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomDrawer);
