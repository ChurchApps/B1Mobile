import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, Dimensions, PixelRatio } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { Loader, WhiteHeader } from "../../components";
import {  globalStyles, UserHelper } from "../../helpers";
import { ErrorHelper, ApiHelper, LoginUserChurchInterface } from "@churchapps/mobilehelper";
import { PersonInterface, ServiceTimeInterface } from "../../interfaces";

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

  const [dimension, setDimension] = useState(Dimensions.get("screen"));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };


  useEffect(() => {
    getServiceData();
    UserHelper.addOpenScreenEvent("ServiceScreen");
    Dimensions.addEventListener("change", () => {
      const dim = Dimensions.get("screen")
      setDimension(dim);
    })
  }, [])
  useEffect(()=>{
  },[dimension])

  


  const getServiceData = async () => {
    setLoading(true);
    ApiHelper.get("/services", "AttendanceApi").then(data => { setLoading(false); setServiceList(data); })
  }

  const ServiceSelection = (item: any) => {
    setLoading(true);
    getMemberData(item.id);
  }

  const getMemberData = async (serviceId: any) => {    
    const currentChurch = JSON.parse((await AsyncStorage.getItem("CHURCH_DATA"))!)
    const churchesList = await AsyncStorage.getItem("CHURCHES_DATA")
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
      member["serviceTime"] = serviceTime;
    })
    try {
      const memberValue = JSON.stringify(memberList)
      await AsyncStorage.setItem("MEMBER_LIST", memberValue)
        .then(() => getGroupListData(serviceId, memberList))
    } catch (error : any) {
      console.log("SET MEMBER LIST ERROR", error)
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

  const getPeopleIds = (memberList: any) => {
    const peopleIds: any[] = [];
    memberList?.forEach((member: any) => {
      peopleIds.push(member.id)
    })
    const people_Ids = escape(peopleIds.join(","))
    return people_Ids
  }

  const getGroupListData = async (serviceId: any, memberList: any) => {
    const data = await ApiHelper.get("/groups", "MembershipApi")
    setLoading(false);
    const peopleIds = getPeopleIds(memberList);
    try {
      const group_tree = createGroupTree(data);
      await AsyncStorage.setItem("GROUP_LIST", JSON.stringify(group_tree))
      await AsyncStorage.setItem("SCREEN", "SERVICE");
      props.navigation.navigate("HouseholdScreen", { serviceId: serviceId, people_Ids: peopleIds })
    } catch (error : any) {
      console.log("SET MEMBER LIST ERROR", error)
      ErrorHelper.logError("get-group-list", error);
    }
  }

  const renderGroupItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity style={[globalStyles.listMainView, globalStyles.groupListView, { width: wd("90%") }]} onPress={() => ServiceSelection(item)}>
          <Text style={globalStyles.groupListTitle} numberOfLines={1}>{item.campus.name} - {item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.grayContainer}>
      <ScrollView>
        <WhiteHeader onPress={() => openDrawer()} title="Checkin" />
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList
            data={serviceList}
            renderItem={({ item }) => renderGroupItem(item)}
            keyExtractor={(item: any) => item.id}
            style={globalStyles.listContainerStyle}
          />
        </SafeAreaView>
      </ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
    </View>
  );
};

