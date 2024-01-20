import { DimensionHelper } from '@churchapps/mobilehelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BottomButton, MainHeader } from '../../components';
import { Constants, UserHelper, globalStyles } from '../../helpers';
import { ErrorHelper } from '../../helpers/ErrorHelper';
import { NavigationProps } from '../../interfaces';

interface Props {
  navigation: NavigationProps;
  route: {
    params: {
      member: any,
      time: any
    }
  };
}

export const GroupsScreen = (props: Props) => {
  const [selected, setSelected] = useState(null);
  const [groupTree, setGroupTree] = useState<any[]>([]);
  const [memberList, setMemberList] = useState([]);

  useEffect(() => {
    getGroupListData();
    UserHelper.addOpenScreenEvent('GroupsScreen');
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
        .then(() => props.navigation.goBack());
    } catch (error: any) {
      console.log('SET MEMBER LIST ERROR', error)
      ErrorHelper.logError("select-group", error);
    }
  }

  const renderGroupItem = (item: any) => (
    <View>
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp('90%') }]} onPress={() => { setSelected(selected != item.key ? item.key : null) }}>
        <Icon name={selected == item.key ? 'angle-down' : 'angle-right'} style={globalStyles.selectionIcon} size={DimensionHelper.wp('6%')} />
        <View style={globalStyles.listTextView}>
          <Text style={[globalStyles.groupListTitle, globalStyles.groupMainTitle]} numberOfLines={1}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      {selected == item.key && item.items.map((item_group: any, index: any) => (
        <View style={{ ...globalStyles.groupView, borderBottomWidth: (index == item.items.length - 1) ? 0 : 1, width: DimensionHelper.wp('80%') }} key={item_group.id}>
          <TouchableOpacity style={globalStyles.groupBtn} onPress={() => selectGroup(item_group)}>
            <Text style={globalStyles.groupText}> {item_group.name} </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <MainHeader title="Checkin" openDrawer={props.navigation.openDrawer} />
      <ScrollView>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={logoSrc}>
            <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
          </View>
          <FlatList data={groupTree} renderItem={({ item }) => renderGroupItem(item)} keyExtractor={(item: any) => item.key} style={globalStyles.listContainerStyle} />
          <BottomButton title="NONE" onPress={() => selectGroup(null)} style={DimensionHelper.wp('100%')} />
        </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
};
