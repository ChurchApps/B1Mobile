import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, PixelRatio, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BottomButton, Loader, MainHeader, NotificationTab } from '../../components';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '../../helpers';
import { ErrorHelper } from '../../helpers/ErrorHelper';
import { eventBus } from '../../helpers/PushNotificationHelper';

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
}

export const HouseholdScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [selected, setSelected] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [groupTree, setGroupTree] = useState<any[]>([]);
  const [NotificationModal, setNotificationModal] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };


  useEffect(() => {
    getMemberFromStorage();
    UserHelper.addOpenScreenEvent('HouseholdScreen');
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, []);
  useEffect(()=>{
  },[dimension])

  useEffect(() => {
    const handleNewMessage = () => {
      setBadgeCount((prevCount) => prevCount + 1);
    };
    eventBus.addListener("badge", handleNewMessage);
    return () => {
      eventBus.removeListener("badge");
    };
  });

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

    } catch (error : any) {
      console.log('MEMBER LIST ERROR', error)
      ErrorHelper.logError("get-member-from-storage", error);
    }
  }

  const loadExistingAttendance = async (memberList: any, group_tree: any) => {
    const serviceId = props.route.params.serviceId;
    const people_Ids = props.route.params.people_Ids;
    setLoading(true);

    const data = ApiHelper.get("/visits/checkin?serviceId=" + serviceId + "&peopleIds=" + people_Ids + "&include=visitSessions", "AttendanceApi");
    setLoading(false);
    setExistingAttendance(data, memberList, group_tree)
  }

  const setExistingAttendance = async (existingAttendance: any, memberList: any, group_tree: any) => {
    let member_list = [...memberList];
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
    } catch (error : any) {
      console.log('SET MEMBER LIST ERROR', error)
      ErrorHelper.logError("set-attendance", error);
    }
  }

  const RightComponent = (
    <TouchableOpacity onPress={() => { toggleTabView() }}>
      {badgeCount > 0
        ? <View style={{ flexDirection: 'row' }}>
          <Image source={Constants.Images.dash_bell} style={globalStyles.BadgemenuIcon} />
          <View style={globalStyles.BadgeDot}></View>
        </View>
        : <View>
          <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
        </View>}
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
    setBadgeCount(0)
  };
  const submitAttendance = async () => {
    setLoading(true);
    const serviceId = props.route.params.serviceId;
    const people_Ids = props.route.params.people_Ids;

    let pendingVisits: any[] = [];
    memberList?.forEach((member: any) => {
      let visitSessionList: any[] = [];
      member.serviceTime?.forEach((time: any) => {
        if (time.selectedGroup != null) {
          visitSessionList.push({ session: { serviceTimeId: time.id, groupId: time.selectedGroup.id, displayName: time.selectedGroup.name } })
        }
      })
      if (visitSessionList.length != 0) {
        pendingVisits.push({ personId: member.id, serviceId: serviceId, visitSessions: visitSessionList })
      }
    })

    ApiHelper.post("/visits/checkin?serviceId=" + serviceId + "&peopleIds=" + people_Ids, pendingVisits, "AttendanceApi");
    setLoading(false);
    try {
      await AsyncStorage.removeItem('MEMBER_LIST')
      await AsyncStorage.removeItem('GROUP_LIST')
      navigate('CheckinCompleteScreen', {})
    } catch (error : any) {
      console.log('CLEAR MEMBER LIST ERROR', error)
      ErrorHelper.logError("submit-attendance", error);
    }

  }

  const renderMemberItem = (item: any) => (
    <View>
      <TouchableOpacity style={[globalStyles.listMainView, { width: wd('90%') }]} onPress={() => { setSelected(selected != item.id ? item.id : null) }}>
        <Icon name={selected == item.id ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={wp('6%')} />
        <Image source={{ uri: EnvironmentHelper.ContentRoot + item.photo }} style={globalStyles.memberListIcon} />
        <View style={globalStyles.memberListTextView}>
          <Text style={[globalStyles.listTitleText, globalStyles.memberListTitle]} numberOfLines={1}>{item.name.display}</Text>
          {selected != item.id && item.serviceTime.map((item_time: any, index: any) => (
            <View key={item_time.id}>
              {item_time.selectedGroup
                ? <Text style={globalStyles.selectedText} numberOfLines={1}>
                  {item_time.name}{" - "}{item_time.selectedGroup.name}
                </Text>
                : null}
            </View>
          ))}
        </View>
      </TouchableOpacity>
      {selected == item.id && item.serviceTime && item.serviceTime.map((item_time: any, index: any) => (
        <View style={{ ...globalStyles.classesView, borderBottomWidth: (index == item.serviceTime.length - 1) ? 0 : 1,width:wd('90%') }} key={item_time.id}>
          <View style={globalStyles.classesTimeView}>
            <Icon name={'clock-o'} style={globalStyles.timeIcon} size={wp('5%')} />
            <Text style={globalStyles.classesTimeText}>{item_time.name}</Text>
          </View>
          <TouchableOpacity style={{ ...globalStyles.classesNoneBtn, backgroundColor: item_time.selectedGroup ? Constants.Colors.button_green : Constants.Colors.button_bg }}
            onPress={() => item_time.selection ? null : navigate('GroupsScreen', { member: item, time: item_time, serviceId: props.route.params.serviceId })}>
            <Text style={globalStyles.classesNoneText} numberOfLines={3}>
              {item_time.selectedGroup ? item_time.selectedGroup.name : 'NONE'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader
        leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>}
        mainComponent={<Text style={globalStyles.headerText}>Checkin</Text>}
        rightComponent={RightComponent}
      />
      <ScrollView>
        {/* <WhiteHeader onPress={() => openDrawer()} title="Checkin" /> */}

        <SafeAreaView style={{ flex: 1 }}>
          <View style={logoSrc}>
            <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
          </View>
          <FlatList data={memberList} renderItem={({ item }) => renderMemberItem(item)} keyExtractor={(item: any) => item.id} style={globalStyles.listContainerStyle} />
          <BottomButton title="CHECKIN" onPress={() => submitAttendance()} style={wd('100%')} />
        </SafeAreaView>
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
      {NotificationModal
        ? <NotificationTab />
        : null}
    </SafeAreaView>
  );
};

