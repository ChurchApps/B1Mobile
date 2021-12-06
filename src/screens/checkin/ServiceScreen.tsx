import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Loader, WhiteHeader } from '../../components';
import { createGroupTree, getPeopleIds, getToken } from '../../helpers/_ApiHelper';
import { ApiHelper, globalStyles } from '../../helpers';
import { PersonInterface, ServiceTimeInterface } from '../../interfaces';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const ServiceScreen = (props: Props) => {
  const { goBack, openDrawer } = props.navigation;
  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);

  useEffect(() => {
    getServiceData();
  }, [])

  const getServiceData = async () => {
    setLoading(true);
    ApiHelper.get("/services", "AttendanceApi").then(data => { setLoading(false); setServiceList(data); })
  }

  const ServiceSelection = (item: any) => {
    setLoading(true);
    getMemberData(item.id);
  }

  const getMemberData = async (serviceId: any) => {
    const token = await getToken('default')
    const member_token = await getToken("MembershipApi")
    const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
    if (token !== null && churchvalue !== null && member_token != null) {
      const churchData = JSON.parse(churchvalue);
      const personId = churchData.personId

      if (personId) {
        const person: PersonInterface = await ApiHelper.get("/people/" + personId, "MembershipApi");
        const householdMembers: PersonInterface[] = await ApiHelper.get("/people/household/" + person.householdId, "MembershipApi");
        const serviceTimes: ServiceTimeInterface = await ApiHelper.get("/serviceTimes?serviceId" + serviceId, "AttendanceApi");
        createHouseholdTree(serviceId, serviceTimes, householdMembers);
      }
    }
  }


  const createHouseholdTree = async (serviceId: any, serviceTime: any, memberList: any) => {
    memberList?.forEach((member: any) => {
      member['serviceTime'] = serviceTime;
    })
    try {
      const memberValue = JSON.stringify(memberList)
      await AsyncStorage.setItem('MEMBER_LIST', memberValue)
        .then(() => getGroupListData(serviceId, memberList))
    } catch (error) {
      console.log('SET MEMBER LIST ERROR', error)
    }
  }

  const getGroupListData = async (serviceId: any, memberList: any) => {
    const data = await ApiHelper.get("/groups", "MembershipApi")
    setLoading(false);
    const peopleIds = getPeopleIds(memberList);
    try {
      const group_tree = createGroupTree(data);
      await AsyncStorage.setItem('GROUP_LIST', JSON.stringify(group_tree))
      await AsyncStorage.setItem('SCREEN', 'SERVICE');
      props.navigation.navigate('HouseholdScreen', { serviceId: serviceId, people_Ids: peopleIds })
    } catch (error) {
      console.log('SET MEMBER LIST ERROR', error)
    }
  }

  const renderGroupItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity style={[globalStyles.listMainView, globalStyles.groupListView]} onPress={() => ServiceSelection(item)}>
          <Text style={globalStyles.groupListTitle} numberOfLines={1}>{item.campus.name} - {item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.grayContainer}>
      <WhiteHeader onPress={() => openDrawer()} />
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={serviceList}
          renderItem={({ item }) => renderGroupItem(item)}
          keyExtractor={(item: any) => item.id}
          style={globalStyles.listContainerStyle}
        />
      </SafeAreaView>
      {isLoading && <Loader isLoading={isLoading} />}
    </View>
  );
};

