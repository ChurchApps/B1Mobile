import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, FunctionComponent } from 'react';
import { SafeAreaView, ScrollView, Text, Image, TouchableOpacity, View, Dimensions, PixelRatio } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';

import { globalStyles, UserHelper, Constants } from '../../helpers';
import { BottomButton, MainHeader, NotificationTab } from '../../components';
import { ErrorHelper } from '../../helpers/ErrorHelper';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
    addListener: (type: string, callback: any) => void;
  };
  route: {
    params: {
      member: any,
      time: any
    }
  };
}

export const GroupsScreen: FunctionComponent<Props> = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [selected, setSelected] = useState(null);
  const [groupTree, setGroupTree] = useState<any[]>([]);
  const [memberList, setMemberList] = useState([]);
  const [NotificationModal, setNotificationModal] = useState(false);

  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  useEffect(() => {
    getGroupListData();
    UserHelper.addOpenScreenEvent('GroupsScreen');
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, []);

  useEffect(() => {
  }, [dimension])

  const RightComponent = (
    <TouchableOpacity onPress={() => toggleTabView()}>
      <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
  };

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
    } catch (error: any) {
      console.log('MEMBER LIST ERROR', error)
      ErrorHelper.logError("group-list-data", error);
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
    } catch (error: any) {
      console.log('SET MEMBER LIST ERROR', error)
      ErrorHelper.logError("select-group", error);
    }
  }

  const renderGroupItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity style={[globalStyles.listMainView, { width: wd('90%') }]} onPress={() => { setSelected(selected != item.key ? item.key : null) }}>
          <Icon name={selected == item.key ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={wp('6%')} />
          <View style={globalStyles.listTextView}>
            <Text style={[globalStyles.groupListTitle, globalStyles.groupMainTitle]} numberOfLines={1}>{item.name}</Text>
          </View>
        </TouchableOpacity>
        {selected == item.key && item.items.map((item_group: any, index: any) => {
          return (
            <View style={{ ...globalStyles.groupView, borderBottomWidth: (index == item.items.length - 1) ? 0 : 1, width: wd('80%') }} key={item_group.id}>
              <TouchableOpacity style={globalStyles.groupBtn} onPress={() => selectGroup(item_group)}>
                <Text style={globalStyles.groupText}> {item_group.name} </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }
  const logoSrc = Constants.Images.logoBlue;
  return (
    <View style={globalStyles.grayContainer}>
       <MainHeader
          leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
            <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
          </TouchableOpacity>}
          mainComponent={<Text style={globalStyles.headerText}>Checkin</Text>}
          rightComponent={RightComponent}
        />
        <View style={logoSrc}>
          <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
        </View>
      <ScrollView>
       
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList data={groupTree} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.key} style={globalStyles.listContainerStyle} />
          <BottomButton title='NONE' onPress={() => selectGroup(null)} style={wd('100%')} />
        </SafeAreaView>
      </ScrollView>
      {NotificationModal ?
      <NotificationTab/>
      : null}
    </View>
  );
};
