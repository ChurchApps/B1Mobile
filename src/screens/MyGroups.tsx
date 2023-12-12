import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { ApiHelper, GroupInterface, globalStyles, Constants } from "../helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageButton } from "../components/ImageButton";
import { NavigationHelper } from "../helpers/NavigationHelper";
import { MainHeader, NotificationTab } from "../components";



const MyGroups = (props: any) => {
  const { openDrawer } = props.navigation;
  const [groups, setGroups] = useState([]);
  const [NotificationModal, setNotificationModal] = useState(false);

  const loadData = async () => {
    const data = await ApiHelper.get("/groups/my", "MembershipApi");
    setGroups(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showGroups = (topItem: boolean, item: any) => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <ImageButton
          image={{ uri: item.photoUrl }}
          text={item.name}
          onPress={() => props.navigation.navigate('GroupDetails', { group: item })}
        />
      </View>
    );
  };

  const RightComponent = (
    <TouchableOpacity onPress={() => toggleTabView()}>
      <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
  };
  const getGroups = () => {
    return (
      <FlatList
        data={groups}
        contentContainerStyle={{ marginTop: 15 }}
        renderItem={({ item }) => showGroups(false, item)}
        keyExtractor={(item: any) => item.id}
      />
    );
  };

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
      <MainHeader
        leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>}
        mainComponent={<Text style={globalStyles.headerText}>My Groups</Text>}
        rightComponent={RightComponent}
      />
      <View style={globalStyles.webViewContainer}>{getGroups()}</View>
      {
        NotificationModal ?
          <NotificationTab /> : null
      }
    </SafeAreaView>
  );
};

export default MyGroups;

const styles = StyleSheet.create({});
