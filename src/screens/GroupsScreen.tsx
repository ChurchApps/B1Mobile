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
import { createGroupTree, getToken } from '../helper/ApiHelper';
import { getGroupList } from '../redux/actions/groupsListAction';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Images from '../utils/Images';

interface Props {
    navigation: {
        navigate: (screenName: string) => void;
        goBack: () => void;
        openDrawer: () => void;
        addListener: (type: string, callback: any) => void;
    };
    getGroupListApi: (token: any, callback: any) => void;
    route: {
        params: {
            member: any,
            time: any
        }
    };
}

const GroupsScreen = (props: Props) => {
    const { navigate, goBack, openDrawer } = props.navigation;
    const [selected, setSelected] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [groupTree, setGroupTree] = useState<any[]>([]);
    const [memberList, setMemberList] = useState([]);

    useEffect(() => {
        getGroupListData();
    }, []);

    useEffect(() => {
        getGroupListData();
        const init = props.navigation.addListener('focus', async () => {
            await getGroupListData();
        });
        return init;
    }, [props.navigation]);

    const getGroupListData = async () => {
        try {
            setSelected(null);
            await AsyncStorage.setItem('SCREEN', 'GROUP')
            const group_list = await AsyncStorage.getItem('GROUP_LIST')
            const member_list = await AsyncStorage.getItem('MEMBER_LIST')
            if (group_list != null && member_list != null) {
                setMemberList(JSON.parse(member_list))
                setGroupTree(JSON.parse(group_list));
            }
        } catch (error) {
            console.log('MEMBER LIST ERROR', error)
        }
    }

    const selectGroup = async (group_item: any) => {
        memberList?.forEach((member: any) => {
            member.serviceTime?.forEach((time: any) => {
                if (member.id == props.route.params.member.id) {
                    if (time.id == props.route.params.time.id) {
                        time['selectedGroup'] = group_item;
                    }
                }
            })
        })
        try {
            const memberValue = JSON.stringify(memberList)
            await AsyncStorage.setItem('MEMBER_LIST', memberValue)
                .then(() => goBack());
        } catch (error) {
            console.log('SET MEMBER LIST ERROR', error)
        }
    }

    const renderGroupItem = (item: any) => {
        return (
            <View>
                <TouchableOpacity style={styles.groupListView} onPress={() => { setSelected(selected != item.key ? item.key : null) }}>
                    <Icon name={selected == item.key ? 'angle-down' : 'angle-right'} style={styles.selectionIcon} size={wp('6%')} />
                    <View style={styles.groupListTextView}>
                        <Text style={styles.groupListTitle} numberOfLines={1}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
                {selected == item.key && item.items.map((item_group: any, index: any) => {
                    return (
                        <View style={{
                            ...styles.classesView,
                            borderBottomWidth: (index == item.items.length - 1) ? 0 : 1
                        }} key={item_group.id}>
                            <TouchableOpacity
                                style={styles.classesBtn}
                                onPress={() => selectGroup(item_group)}
                            >
                                <Text style={styles.classesText}>
                                    {item_group.name}
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
                    data={groupTree}
                    renderItem={({ item }) => renderGroupItem(item)}
                    keyExtractor={(item: any) => item.key}
                    style={styles.groupListStyle}
                />
                <TouchableOpacity style={styles.noneBtn} onPress={() => selectGroup(null)}>
                    <Text style={{ ...styles.classesText, color: 'white' }}>
                        NONE
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
    groupListView: {
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
    groupListTextView: {
        height: wp('12%'),
        justifyContent: 'space-evenly'
    },
    groupListTitle: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoMedium,
        color: Colors.app_color,
        marginLeft: wp('3%'),
        width: wp('65%'),
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
        group_list: state.group_list,
    };
};
const mapDispatchToProps = (dispatch: any) => {
    return {
        getGroupListApi: (token: any, callback: any) => dispatch(getGroupList(token, callback)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsScreen);
