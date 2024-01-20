import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { MainHeader } from "../components";
import { ImageButton } from "../components/ImageButton";
import { ApiHelper, globalStyles } from "../helpers";

const MyGroups = (props: any) => {
  const [groups, setGroups] = useState([]);

  const loadData = async () => {
    const data = await ApiHelper.get("/groups/my", "MembershipApi");
    setGroups(data);
  };

  useEffect(() => { loadData(); }, []);

  const showGroups = (topItem: boolean, item: any) => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <ImageButton image={{ uri: item.photoUrl }} text={item.name} onPress={() => props.navigation.navigate('GroupDetails', { group: item })} />
      </View>
    );
  };

  const getGroups = () => {
    return (<FlatList data={groups} contentContainerStyle={{ marginTop: 15 }} renderItem={({ item }) => showGroups(false, item)} keyExtractor={(item: any) => item.id} />);
  };

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
      <MainHeader title="My Groups" openDrawer={props.navigation.openDrawer} />
      <View style={globalStyles.webViewContainer}>{getGroups()}</View>
    </SafeAreaView>
  );
};

export default MyGroups;