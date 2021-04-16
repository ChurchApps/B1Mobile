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
import { getServicesData } from '../redux/actions/servicesAction';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
    };
    getServicesDataApi: (token: any, callback: any) => void;
}

const ServiceScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [groupList, setGroupList] = useState([]);

    useEffect(() => {
        getServiceData();
    }, [])


    const getServiceData = async() => {
        setLoading(true);
        const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
        if (churchvalue !== null) {
            const token = JSON.parse(churchvalue).jwt
            props.getServicesDataApi(token, (err: any, res: any) => {
                setLoading(false);
                if (!err) {
                    if (res.data) { 
                        setGroupList(res.data)
                    }
                } else {
                    Alert.alert("Alert", err.message);
                }
            });
        }
    }

    const renderGroupItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.groupListView} onPress={() => { navigate('HouseholdScreen') }}>
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
                    data={groupList}
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
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getServicesDataApi: (token: any, callback: any) => dispatch(getServicesData(token, callback)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceScreen);
