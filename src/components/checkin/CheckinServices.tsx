import { ArrayHelper, DimensionHelper, ErrorHelper } from '@churchapps/mobilehelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { ApiHelper, CheckinHelper, LoginUserChurchInterface, PersonInterface, ServiceTimeInterface, UserHelper, globalStyles } from '../../helpers';
import { Loader } from '../Loader';

interface Props {
  onDone: () => void
}

export const CheckinServices = (props: Props) => {
  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);
 
  useEffect(() => {
    getServiceData();
    UserHelper.addOpenScreenEvent('ServiceScreen');
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
    const currentChurch = JSON.parse((await AsyncStorage.getItem('CHURCH_DATA'))!)
    const churchesList = await AsyncStorage.getItem('CHURCHES_DATA')
    const tst : LoginUserChurchInterface[] = JSON.parse(churchesList!);
    const currentData : LoginUserChurchInterface | undefined = tst.find((value, index) => value.church.id == currentChurch!.id);

    if(currentData != null || currentData != undefined){
        const personId = currentData.person.id
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
    } catch (error : any) {
      console.log('SET MEMBER LIST ERROR', error)
      ErrorHelper.logError("create-household", error);
    }
  }

  const createGroupTree = (groups: any) => {
    var category = "";
    var group_tree: any[] = [];

    const sortedGroups = groups.sort((a: any, b: any) => {
      return ((a.categoryName || "") > (b.categoryName || "")) ? 1 : -1;
    });

    sortedGroups?.forEach((group: any) => {
      if (group.categoryName !== category) group_tree.push({ key: group_tree.length, name: group.categoryName || "", items: [] })
      group_tree[group_tree.length - 1].items.push(group);
      category = group.categoryName || "";
    })
    return group_tree;
  }

  const getGroupListData = async (serviceId: any, memberList: any) => {
    const data = await ApiHelper.get("/groups", "MembershipApi")
    setLoading(false);
    try {
      const group_tree = createGroupTree(data);
      CheckinHelper.groupTree = group_tree;
      CheckinHelper.serviceId = serviceId;
      CheckinHelper.peopleIds = ArrayHelper.getIds(memberList, "id");
      props.onDone();
    } catch (error : any) {
      console.log('SET MEMBER LIST ERROR', error)
      ErrorHelper.logError("get-group-list", error);
    }
  }
  
  const renderGroupItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity style={[globalStyles.listMainView, globalStyles.groupListView, { width: DimensionHelper.wp('90%') }]} onPress={() => ServiceSelection(item)}>
          <Text style={globalStyles.groupListTitle} numberOfLines={1}>{item.campus.name} - {item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (isLoading) return <Loader isLoading={isLoading} />
  else return (<><FlatList
    data={serviceList}
    renderItem={({ item }) => renderGroupItem(item)}
    keyExtractor={(item: any) => item.id}
    style={globalStyles.listContainerStyle}
  /></>);
};
