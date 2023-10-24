import { StyleSheet, Text, View, SafeAreaView, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {  globalStyles } from "../helpers";
import { ApiHelper, GroupInterface } from "@churchapps/mobilehelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageButton } from "../components/ImageButton";
import { NavigationHelper } from "../helpers/NavigationHelper";
import { SimpleHeader } from "../components";

const MyGroups = (props: any) => {
  const { openDrawer } = props.navigation;
  const [groups, setGroups] = useState([]);

  const loadData = async () => {
    const data = await ApiHelper.get("/groups/my", "MembershipApi");
    setGroups(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showGroups = (topItem: boolean, item: any) => {
    return (
      <View style={{marginHorizontal: 16}}>
        <ImageButton
          image={{uri: item.photoUrl}}
          text={item.name}
          onPress={() => props.navigation.navigate("GroupDetails", {group: item})}
        />
      </View>
    );
  };

  const getGroups = () => {
    return (
      <FlatList
        data={groups}
        renderItem={({ item }) => showGroups(false, item)}
        keyExtractor={(item: any) => item.id}
      />
    );
  };

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: "100%" }]}>
      <SimpleHeader onPress={() => openDrawer()} title="My Groups" />
      <View style={[globalStyles.webViewContainer, {marginTop: 16}]}>{getGroups()}</View>
    </SafeAreaView>
  );
};

export default MyGroups;

const styles = StyleSheet.create({});
