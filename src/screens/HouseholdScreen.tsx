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
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGE_URL } from '../helper/ApiConstants';
import { loadAttendanceData } from '../redux/actions/loadAttendanceAction';
import { getToken } from '../helper/ApiHelper';
import { submitAttendanceData } from '../redux/actions/submitAttendanceAction';

interface Props {
    navigation: {
        navigate: (screenName: string, params: any) => void;
        goBack: () => void;
        openDrawer: () => void;
        addListener: (type: string, callback: any) => void;
    };
    route: {
        params: {
            serviceId: any,
        }
    };
    loadAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => void;
    submitAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => void;
}

const HouseholdScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [memberList, setMemberList] = useState([]);

    React.useEffect(() => {
        getMemberFromStorage();
        const unsubscribe = props.navigation.addListener('focus', () => {
            getMemberFromStorage();
        });
        return unsubscribe;
    }, [props.navigation]);

    const getMemberFromStorage = async () => {
        try {
            const member_list = await AsyncStorage.getItem('MEMBER_LIST')
            if (member_list != null) {
                setMemberList(JSON.parse(member_list));
                loadExistingAttendance();
            }
        } catch (error) {
            console.log('GET MEMBER LIST ERROR', error)
        }
    }

    const loadExistingAttendance = async() => {
        const serviceId = props.route.params.serviceId;
        const token = await getToken('AttendanceApi')
        const peopleIds: any[] = [];
        memberList?.forEach((member:any) => {
            peopleIds.push(member.id)
        })
        props.loadAttendanceDataApi(serviceId, peopleIds, token, (err: any, res: any) => {
            if (!err) {
                console.log('Existing Attendance--->',res.data)
            } else {
                Alert.alert("Alert", err.message);
            }
        });
    }

    const submitAttendance = async() => {
        navigate('CheckinCompleteScreen', {})
        // const serviceId = props.route.params.serviceId;
        // const token = await getToken('AttendanceApi')
        // const peopleIds: any[] = [];
        // memberList?.forEach((member:any) => {
        //     peopleIds.push(member.id)
        // })
        // props.submitAttendanceDataApi(serviceId, peopleIds, token, (err: any, res: any) => {
        //     if (!err) {
        //         console.log('Submit Attendance--->',res.data)
        //         navigate('CheckinCompleteScreen', {})
        //     } else {
        //         Alert.alert("Alert", err.message);
        //     }
        // });
    }

    const renderMemberItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.memberListView} onPress={() => { setSelected(selected != item.id ? item.id : null) }}>
                    <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={styles.selectionIcon} size={wp('6%')} />
                    <Image source={{ uri: IMAGE_URL + item.photo }} style={styles.memberListIcon} />
                    <View style={styles.memberListTextView}>
                        <Text style={styles.memberListTitle} numberOfLines={1}>{item.name.display}</Text>
                        {selected != item.id && item.serviceTime.map((item_time: any, index: any) => {
                            return (
                                <View key={item_time.id}>
                                    {item_time.selectedGroup ?
                                        <Text style={styles.selectedText} numberOfLines={1}>
                                            {item_time.name}{" - "}{item_time.selectedGroup.name}
                                        </Text>
                                        : null}
                                </View>
                            );
                        })}
                    </View>
                </TouchableOpacity>
                {selected == item.id && item.serviceTime && item.serviceTime.map((item_time: any, index: any) => {
                    return (
                        <View style={{
                            ...styles.classesView,
                            borderBottomWidth: (index == item.serviceTime.length - 1) ? 0 : 1
                        }}
                            key={item_time.id}>
                            <View style={styles.classesTimeView}>
                                <Icon name={'clock-o'} style={styles.timeIcon} size={wp('5%')} />
                                <Text style={styles.classesTimeText}>{item_time.name}</Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    ...styles.classesNoneBtn,
                                    backgroundColor: item_time.selectedGroup ? Colors.button_green : Colors.button_bg
                                }}
                                onPress={() => item_time.selection ? null : navigate('GroupsScreen', { member: item, time: item_time })}>
                                <Text style={styles.classesNoneText} numberOfLines={3}>
                                    {item_time.selectedGroup ? item_time.selectedGroup.name : 'NONE'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CheckinHeader onPress={() => openDrawer()} />
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={memberList}
                    renderItem={({ item }) => renderMemberItem(item)}
                    keyExtractor={(item: any) => item.id}
                    style={styles.memberListStyle}
                />
                <TouchableOpacity style={styles.checkinBtn} onPress={() => submitAttendance()}>
                    <Text style={styles.checkinBtnText}>
                        CHECKIN
                    </Text>
                </TouchableOpacity>
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
    memberListView: {
        width: wp('90%'),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'flex-start',
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
    memberListIcon: {
        width: wp('16%'),
        height: wp('16%'),
        marginHorizontal: wp('2%'),
        marginVertical: wp('2%'),
        borderRadius: wp('1.5%')
    },
    memberListTextView: {
        width: wp('62%'),
        marginVertical: wp('2%'),
        justifyContent: 'space-evenly',
    },
    memberListTitle: {
        fontSize: wp('4.2%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
        marginLeft: wp('2%'),
        width: wp('65%'),
    },
    memberListStyle: {
        marginVertical: wp('3%'),
    },
    selectionIcon: {
        fontSize: wp('6%'),
        color: 'gray',
        marginLeft: wp('3%')
    },
    timeIcon: {
        fontSize: wp('5%'),
        color: Colors.app_color,
        marginHorizontal: wp('1%')
    },
    classesView: {
        width: wp('90%'),
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: wp('2%'),
        paddingBottom: wp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },
    classesNoneBtn: {
        width: wp('55%'),
        height: wp('16%'),
        marginHorizontal: wp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wp('2%'),
    },
    classesTimeView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    classesTimeText: {
        textAlign: 'center',
        fontSize: wp('3.7%'),
        color: Colors.app_color,
    },
    selectedText: {
        width: wp('62%'),
        textAlign: 'left',
        fontSize: wp('3.4%'),
        color: Colors.button_green,
        marginLeft: wp('2%'),
        marginVertical: wp('0.5%'),
    },
    classesNoneText: {
        width: wp('50%'),
        color: 'white',
        fontSize: wp('3.5%'),
        textAlign: 'center'
    },
    checkinBtnText: {
        color: 'white',
        fontSize: wp('4.2%'),
        textAlign: 'center',
        fontFamily: Fonts.RobotoMedium,
    },
    checkinBtn: {
        width: wp('100%'),
        height: wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button_bg
    },
})

const mapStateToProps = (state: any) => {
    return {
        load_attendance: state.load_attendance,
        submit_attendance: state.submit_attendance,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        loadAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => dispatch(loadAttendanceData(serviceId, peopleIds, token, callback)),
        submitAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => dispatch(submitAttendanceData(serviceId, peopleIds, token, callback)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HouseholdScreen);
