import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import CheckinHeader from '../components/CheckinHeader';
import Loader from '../components/Loader';
import { getToken } from '../helper/ApiHelper';
import { getGroupList } from '../redux/actions/groupsListAction';
import { getHouseholdList } from '../redux/actions/householdListAction';
import { getMemberData } from '../redux/actions/memberDataAction';
import { getServicesData } from '../redux/actions/servicesAction';
import { getServicesTimeData } from '../redux/actions/servicesTimeAction';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string, params: any) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    getServicesDataApi: (token: any, callback: any) => void;
    getMemberDataApi: (userId: any, token: any, callback: any) => void;
    getHouseholdListApi: (householdId: any, token: any, callback: any) => void;
    getServicesTimeDataApi: (serviceId: any, token: any, callback: any) => void;
    getGroupListApi: (token: any, callback: any) => void;
}

const ServiceScreen = (props: Props) => {
    const { goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [serviceList, setServiceList] = useState([]);
    const [serviceId, setServiceId] = useState('');

    useEffect(() => {
        getServiceData();
    }, [])

    const getServiceData = async() => {
        setLoading(true);
        const token = await getToken('default')
        if (token != null) {
            props.getServicesDataApi(token, (err: any, res: any) => {
                setLoading(false);
                if (!err) {
                    if (res.data) { 
                        setServiceList(res.data)
                    }
                } else {
                    Alert.alert("Alert", err.message);
                }
            });
        }
    }

    const ServiceSelection = (item: any) => { 
        setLoading(true);
        setServiceId(item.id);
        getMemberData();
    }

    const getMemberData = async () => {
        const token = await getToken('default')
        const user = await AsyncStorage.getItem('USER_DATA')
        if (token !== null && user !== null) {
            const userId = JSON.parse(user).id
            props.getMemberDataApi(userId, token, (err: any, res: any) => {
                if (!err) {
                    if (res.data && res.data.householdId) {
                        getHouseholdList(res.data.householdId, token)
                    }
                } else {
                    Alert.alert("Alert", err.message);
                }
            });
        }
    }

    const getHouseholdList = (householdId: String, token: any) => {
        props.getHouseholdListApi(householdId, token, (err: any, res: any) => {
            if (!err) {
                if (res.data) { 
                    getServicesTimeData(serviceId, token, res.data)
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const getServicesTimeData = (serviceId: any, token: any, memberList: any) => {
        props.getServicesTimeDataApi(serviceId, token, (err: any, res: any) => {
            if (!err) {
                createHouseholdTree(res.data, memberList)
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const createHouseholdTree = async(serviceTime: any, memberList: any) => {
        memberList?.forEach((member:any) => {
            member['serviceTime'] = serviceTime;
        })
        try {
            const memberValue = JSON.stringify(memberList)
            await AsyncStorage.setItem('MEMBER_LIST', memberValue)
            getGroupListData()
        } catch (error) {
            console.log('SET MEMBER LIST ERROR',error)
        }
    }

    const getGroupListData = async () => {
        const token = await getToken("MembershipApi")
        props.getGroupListApi(token, async (err: any, res: any) => {
            setLoading(false);
            if (!err) {
                try {
                    const groupValue = JSON.stringify(res.data)
                    await AsyncStorage.setItem('GROUP_LIST', groupValue)
                    .then(() => props.navigation.navigate('HouseholdScreen',{ serviceId: serviceId }))
                } catch (error) {
                    console.log('SET MEMBER LIST ERROR',error)
                }
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const renderGroupItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.groupListView} onPress={() => ServiceSelection(item)}>
                    <Text style={styles.groupListTitle} numberOfLines={1}>{item.campus.name} - {item.name}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CheckinHeader onPress={() => openDrawer()}/>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={serviceList}
                    renderItem={({ item }) => renderGroupItem(item)}
                    keyExtractor={(item: any) => item.id}
                    style={styles.groupListStyle}
                />
            </SafeAreaView>
            {isLoading && <Loader loading={isLoading} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray_bg
    },
    groupListView: {
        width: wp('90%'),
        height: wp('15%'),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: wp('2%'),
        borderRadius: wp('2%'),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: wp('1.5%'),
        elevation: 5,
        shadowColor: Colors.app_color,
        flexDirection: 'row',
    },
    groupListTextView: {
        height: wp('12%'),
        justifyContent: 'center',
        alignItems:'center',
        alignContent:'center',
        backgroundColor:'red'
    },
    groupListTitle: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
    },
    groupListStyle: {
        marginVertical: wp('3%'),
    },
    selectionIcon: {
        fontSize: wp('6%'),
        color: 'gray',
        marginLeft: wp('3%')
    },
    classesView: {
        width: wp('80%'),
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: wp('2%'),
        paddingBottom: wp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },
    classesBtn: {
        width: wp('75%'),
        height: wp('8%'),
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    classesText: {
        color: Colors.app_color,
        fontSize: wp('4.2%'),
        marginHorizontal: wp('2.5%')
    },
    noneBtn: {
        width: wp('100%'),
        height: wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button_red
    },
})

const mapStateToProps = (state: any) => {
    return {
        service_data: state.service_data,
        member_data: state.member_data,
        household_list: state.household_list,
        service_time: state.service_time,
        group_list: state.group_list,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getServicesDataApi: (token: any, callback: any) => dispatch(getServicesData(token, callback)),
        getMemberDataApi: (userId: any, token: any, callback: any) => dispatch(getMemberData(userId, token, callback)),
        getHouseholdListApi: (householdId: any, token: any, callback: any) => dispatch(getHouseholdList(householdId, token, callback)),
        getServicesTimeDataApi: (serviceId: any, token: any, callback: any) => dispatch(getServicesTimeData(serviceId, token, callback)),
        getGroupListApi: (token: any, callback: any) => dispatch(getGroupList(token, callback)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceScreen);
