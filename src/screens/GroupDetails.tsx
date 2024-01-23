import { DimensionHelper } from '@churchapps/mobilehelper';
import Markdown from '@ronradtke/react-native-markdown-display';
import React, { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MainHeader } from "../components";
import Conversations from "../components/Notes/Conversations";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../helpers";
import { GroupMemberInterface } from "../interfaces";

const TABS = ["Conversations", "Group Members"];

const GroupDetails = (props: any) => {
  const { navigate } = props.navigation;
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const { id: groupId, name, photoUrl, about } = props?.route?.params?.group;


  const loadData = async () => {
    ApiHelper.get(`/groupmembers?groupId=${groupId}`, "MembershipApi").then(
      (data) => setGroupMembers(data)
    );
  };

  useEffect(() => { loadData(); }, []);

  
  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => {
    return (
      <TouchableOpacity style={[globalStyles.listMainView, { width: DimensionHelper.wp("90%") }]} onPress={() => { navigate("MemberDetailScreen", { member: item.person }); }} >
        <Image style={globalStyles.memberListIcon} source={
          item?.person?.photo
            ? { uri: EnvironmentHelper.ContentRoot + item.person.photo }
            : Constants.Images.ic_member
        } />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>
            {item?.person?.name?.display}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getGroupMembers = () => {
    return ( <FlatList data={groupMembers} renderItem={({ item }) => showGroupMembers(false, item)} keyExtractor={(item: any) => item?.id} /> );
  };

  if (!UserHelper.currentUserChurch?.person?.id) {
    return (<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
        <Text style={globalStyles.searchMainText}>Please Login to view your groups</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[ globalStyles.grayContainer, { alignSelf: "center", width: "100%", backgroundColor: "white" } ]} >
      <MainHeader title={name} openDrawer={props.navigation.openDrawer} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"} enabled>
        <View style={{ margin: 16 }}>
          <Image source={{ uri: photoUrl }} style={globalStyles.groupImage} />
          <Markdown>{about}</Markdown>
        </View>

        <View style={styles.tabContainer}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity style={[styles.tab, activeTab === idx && styles.activeTab]} onPress={() => setActiveTab(idx)} >
              <Text style={[activeTab === idx && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* RENDER CONVERSATION */}

        {activeTab === 0 
          ? (<Conversations contentType="group" contentId={groupId} groupId={groupId} />) 
          : (<View>{getGroupMembers()}</View>)
        }
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  tabContainer: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginLeft: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  activeTab: { borderBottomWidth: 1, borderBottomColor: Constants.Colors.app_color },
  activeTabText: { color: Constants.Colors.app_color, fontWeight: "600" },
});
