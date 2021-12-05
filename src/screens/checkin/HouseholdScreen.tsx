import React, { useState, useEffect } from 'react';
import { Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import Colors from '../../utils/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../helpers/ApiConstants';
import { getToken } from '../../helpers/_ApiHelper';
import { submitAttendanceData } from '../../redux/actions/submitAttendanceAction';
import { loadAttendanceData } from '../../redux/actions/loadAttendanceAction';
import { globalStyles } from '../../helpers';
import { BottomButton, Loader, WhiteHeader } from '../../components';

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
      people_Ids: any
    }
  };
  submitAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, pendingVisits: any, callback: any) => void;
  loadAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => void;
}

const HouseholdScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [selected, setSelected] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [groupTree, setGroupTree] = useState<any[]>([]);

  useEffect(() => {
    getMemberFromStorage();
  }, []);

  useEffect(() => {
    getMemberFromStorage();
    const init = props.navigation.addListener('focus', async () => {
      await getMemberFromStorage();
    });
    return init;
  }, [props.navigation]);

  const getMemberFromStorage = async () => {
    try {
      const member_list = await AsyncStorage.getItem('MEMBER_LIST')
      const group_list = await AsyncStorage.getItem('GROUP_LIST')
      const screen = await AsyncStorage.getItem('SCREEN')
      if (group_list != null && member_list != null) {
        const groups = JSON.parse(group_list);
        const members = JSON.parse(member_list);
        setGroupTree(groups);
        setMemberList(members);
        if (screen == 'SERVICE') {
          setSelected(null);
          loadExistingAttendance(members, groups);
        }
      }

    } catch (error) {
      console.log('MEMBER LIST ERROR', error)
    }
  }

  const loadExistingAttendance = async (memberList: any, group_tree: any) => {
    const serviceId = props.route.params.serviceId;
    const people_Ids = props.route.params.people_Ids;
    setLoading(true);
    const token = await getToken('AttendanceApi')
    props.loadAttendanceDataApi(serviceId, people_Ids, token, async (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        await setExistingAttendance(res.data, memberList, group_tree)
      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  const setExistingAttendance = async (existingAttendance: any, memberList: any, group_tree: any) => {
    var member_list = [...memberList];
    const groupTree = [...group_tree];

    existingAttendance?.forEach((item: any) => {
      item.visitSessions?.forEach(async (visitSession: any) => {
        member_list?.forEach((member: any) => {
          if (member.id == item.personId) {
            member.serviceTime?.forEach((time: any) => {
              if (time.id == visitSession.session.serviceTimeId) {
                groupTree.forEach((group_item: any) => {
                  group_item.items.forEach((itemG: any) => {
                    if (visitSession.session.groupId == itemG.id) {
                      time['selectedGroup'] = itemG;
                    }
                  })
                })
              }
            })
          }
        })
      })
    })
    try {
      setMemberList(member_list)
      const memberValue = JSON.stringify(member_list)
      await AsyncStorage.setItem('MEMBER_LIST', memberValue)
    } catch (error) {
      console.log('SET MEMBER LIST ERROR', error)
    }
  }


  const submitAttendance = async () => {
    setLoading(true);
    const serviceId = props.route.params.serviceId;
    const people_Ids = props.route.params.people_Ids;
    const token = await getToken('AttendanceApi')

    var pendingVisits: any[] = [];
    memberList?.forEach((member: any) => {
      var visitSessionList: any[] = [];
      member.serviceTime?.forEach((time: any) => {
        if (time.selectedGroup != null) {
          visitSessionList.push({ session: { serviceTimeId: time.id, groupId: time.selectedGroup.id, displayName: time.selectedGroup.name } })
        }
      })
      if (visitSessionList.length != 0) {
        pendingVisits.push({ personId: member.id, serviceId: serviceId, visitSessions: visitSessionList })
      }
    })

    props.submitAttendanceDataApi(serviceId, people_Ids, token, pendingVisits, async (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        try {
          await AsyncStorage.removeItem('MEMBER_LIST')
          await AsyncStorage.removeItem('GROUP_LIST')
            .then(() => { navigate('CheckinCompleteScreen', {}) })
        } catch (error) {
          console.log('CLEAR MEMBER LIST ERROR', error)
        }

      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  const renderMemberItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity style={globalStyles.listMainView} onPress={() => { setSelected(selected != item.id ? item.id : null) }}>
          <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={wp('6%')} />
          <Image source={{ uri: API.IMAGE_URL + item.photo }} style={globalStyles.memberListIcon} />
          <View style={globalStyles.memberListTextView}>
            <Text style={[globalStyles.listTitleText, globalStyles.memberListTitle]} numberOfLines={1}>{item.name.display}</Text>
            {selected != item.id && item.serviceTime.map((item_time: any, index: any) => {
              return (
                <View key={item_time.id}>
                  {item_time.selectedGroup ?
                    <Text style={globalStyles.selectedText} numberOfLines={1}>
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
            <View style={{ ...globalStyles.classesView, borderBottomWidth: (index == item.serviceTime.length - 1) ? 0 : 1 }} key={item_time.id}>
              <View style={globalStyles.classesTimeView}>
                <Icon name={'clock-o'} style={globalStyles.timeIcon} size={wp('5%')} />
                <Text style={globalStyles.classesTimeText}>{item_time.name}</Text>
              </View>
              <TouchableOpacity style={{ ...globalStyles.classesNoneBtn, backgroundColor: item_time.selectedGroup ? Colors.button_green : Colors.button_bg }}
                onPress={() => item_time.selection ? null : navigate('GroupsScreen', { member: item, time: item_time, serviceId: props.route.params.serviceId })}>
                <Text style={globalStyles.classesNoneText} numberOfLines={3}>
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
    <View style={globalStyles.grayContainer}>
      <WhiteHeader onPress={() => openDrawer()} />
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList data={memberList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.listContainerStyle} />
        <BottomButton title='CHECKIN' onPress={() => submitAttendance()} />
      </SafeAreaView>
      {isLoading && <Loader isLoading={isLoading} />}
    </View>
  );
};

const mapStateToProps = (state: any) => {
  return {
    submit_attendance: state.submit_attendance,
    load_attendance: state.load_attendance,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    submitAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, pendingVisits: any, callback: any) => dispatch(submitAttendanceData(serviceId, peopleIds, token, pendingVisits, callback)),
    loadAttendanceDataApi: (serviceId: any, peopleIds: any, token: any, callback: any) => dispatch(loadAttendanceData(serviceId, peopleIds, token, callback)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HouseholdScreen);
