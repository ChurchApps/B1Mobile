import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { globalStyles } from '../helper';
import { getGroupList } from '../redux/actions/groupsListAction';
import { BottomButton, WhiteHeader } from '../components';

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
                <TouchableOpacity style={globalStyles.listMainView} onPress={() => { setSelected(selected != item.key ? item.key : null) }}>
                    <Icon name={selected == item.key ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={wp('6%')} />
                    <View style={globalStyles.listTextView}>
                        <Text style={[globalStyles.groupListTitle,globalStyles.groupMainTitle]} numberOfLines={1}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
                {selected == item.key && item.items.map((item_group: any, index: any) => {
                    return (
                        <View style={{ ...globalStyles.groupView, borderBottomWidth: (index == item.items.length - 1) ? 0 : 1 }} key={item_group.id}>
                            <TouchableOpacity style={globalStyles.groupBtn} onPress={() => selectGroup(item_group)}>
                                <Text style={globalStyles.groupText}> {item_group.name} </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    }

    return (
        <View style={globalStyles.grayContainer}>
            <WhiteHeader onPress={() => openDrawer()} />
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList data={groupTree} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.key} style={globalStyles.listContainerStyle} />
                <BottomButton title='NONE' onPress={() => selectGroup(null)}/>
            </SafeAreaView>
        </View>
    );
};

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
