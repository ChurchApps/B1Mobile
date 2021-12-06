import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { Loader, WhiteHeader } from '../../components';
import { createGroupTree, getPeopleIds, getToken } from '../../helpers/_ApiHelper';
import { globalStyles } from '../../helpers';
import { getGroupList } from '../../redux/actions/groupsListAction';
import { getHouseholdList } from '../../redux/actions/householdListAction';
import { getMemberData } from '../../redux/actions/memberDataAction';
import { getServicesData } from '../../redux/actions/servicesAction';
import { getServicesTimeData } from '../../redux/actions/servicesTimeAction';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
  getServicesDataApi: (token: any, callback: any) => void;
  getMemberDataApi: (personId: any, token: any, callback: any) => void;
  getHouseholdListApi: (householdId: any, token: any, callback: any) => void;
  getServicesTimeDataApi: (serviceId: any, token: any, callback: any) => void;
  getGroupListApi: (token: any, callback: any) => void;
}

const ServiceScreen = (props: Props) => {
  const { goBack, openDrawer } = props.navigation;
  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);

  useEffect(() => {
    getServiceData();
  }, [])

  const getServiceData = async () => {
    setLoading(true);
    const token = await getToken('default')
    if (token != null) {
      props.getServicesDataApi(token, (err: any, res: any) => {
        setLoading(false);
        if (!err) {
          if (res.data) {
            setServiceList(res.data)
          }
        } else {
          Alert.alert("Alert", err.message);
        }
      });
    }
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
      props.getMemberDataApi(personId, member_token, (err: any, res: any) => {
        if (!err) {
          if (res.data && res.data.householdId) {
            getHouseholdList(serviceId, res.data.householdId, token)
          }
        } else {
          Alert.alert("Alert", err.message);
        }
      });
    }
  }

  const getHouseholdList = (serviceId: any, householdId: String, token: any) => {
    props.getHouseholdListApi(householdId, token, (err: any, res: any) => {
      if (!err) {
        if (res.data) {
          getServicesTimeData(serviceId, token, res.data)
        }
      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  const getServicesTimeData = (serviceId: any, token: any, memberList: any) => {
    props.getServicesTimeDataApi(serviceId, token, (err: any, res: any) => {
      if (!err) {
        createHouseholdTree(serviceId, res.data, memberList)
      } else {
        Alert.alert("Alert", err.message);
      }
    });
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
    const token = await getToken("MembershipApi")
    props.getGroupListApi(token, async (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        const peopleIds = getPeopleIds(memberList);
        try {
          const group_tree = createGroupTree(res.data);
          await AsyncStorage.setItem('GROUP_LIST', JSON.stringify(group_tree))
          await AsyncStorage.setItem('SCREEN', 'SERVICE')
            .then(() => {
              props.navigation.navigate('HouseholdScreen', { serviceId: serviceId, people_Ids: peopleIds })
            })
        } catch (error) {
          console.log('SET MEMBER LIST ERROR', error)
        }
      } else {
        Alert.alert("Alert", err.message);
      }
    });
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

const mapStateToProps = (state: any) => {
  return {
    service_data: state.service_data,
    member_data: state.member_data,
    household_list: state.household_list,
    service_time: state.service_time,
    group_list: state.group_list,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    getServicesDataApi: (token: any, callback: any) => dispatch(getServicesData(token, callback)),
    getMemberDataApi: (personId: any, token: any, callback: any) => dispatch(getMemberData(personId, token, callback)),
    getHouseholdListApi: (householdId: any, token: any, callback: any) => dispatch(getHouseholdList(householdId, token, callback)),
    getServicesTimeDataApi: (serviceId: any, token: any, callback: any) => dispatch(getServicesTimeData(serviceId, token, callback)),
    getGroupListApi: (token: any, callback: any) => dispatch(getGroupList(token, callback)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceScreen);
