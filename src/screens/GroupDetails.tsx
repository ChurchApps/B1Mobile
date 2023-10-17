import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  PixelRatio,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  ApiHelper,
  Constants,
  EnvironmentHelper,
  UserHelper,
  globalStyles,
} from "../helpers";
import { SimpleHeader } from "../components";
import Markdown from '@ronradtke/react-native-markdown-display'
import { TouchableOpacity } from "react-native-gesture-handler";
import Conversations from "../components/Notes/Conversations";
import { GroupMemberInterface } from "../interfaces";

const TABS = ["Conversations", "Group Members"];

const GroupDetails = (props: any) => {
  const { navigate, openDrawer } = props.navigation;
  const [groupMembers, setGroupMembers] = useState([]);
  const [dimension] = useState(Dimensions.get("screen"));
  const [activeTab, setActiveTab] = useState(0);

  const { id: groupId, name, photoUrl, about } = props?.route?.params?.group;

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  const loadData = async () => {
    ApiHelper.get(`/groupmembers?groupId=${groupId}`, "MembershipApi").then(
      (data) => setGroupMembers(data)
    );
  };

  useEffect(() => {
    loadData();
      }, []);

  const showGroupMembers = (topItem: boolean, item: GroupMemberInterface) => {
    return (
      <TouchableOpacity
        style={[globalStyles.listMainView, { width: wd("90%") }]}
        onPress={() => {
          navigate("MemberDetailScreen", { member: item.person });
        }}
      >
        <Image
          source={
            item?.person?.photo
              ? { uri: EnvironmentHelper.ContentRoot + item.person.photo }
              : Constants.Images.ic_member
          }
          style={globalStyles.memberListIcon}
        />
        <View style={globalStyles.listTextView}>
          <Text style={globalStyles.listTitleText}>
            {item?.person?.name?.display}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getGroupMembers = () => {
    return (
      <FlatList
        data={groupMembers}
        renderItem={({ item }) => showGroupMembers(false, item)}
        keyExtractor={(item: any) => item?.id}
      />
    );
  };

  if (!UserHelper.currentUserChurch?.person?.id) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={globalStyles.searchMainText}>
          Please Login to view your groups
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        globalStyles.grayContainer,
        { alignSelf: "center", width: "100%", backgroundColor: "white" },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "position" : "height"}
        enabled
      >
        <SimpleHeader onPress={() => openDrawer()} title={name} />
        <View style={{ margin: 16 }}>
          <Image source={{ uri: photoUrl }} style={globalStyles.groupImage} />
          <Markdown>{about}</Markdown>
        </View>

        <View style={styles.tabContainer}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === idx && styles.activeTab]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[activeTab === idx && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* RENDER CONVERSATION */}

        {activeTab === 0 ? (
          <Conversations
            contentType="group"
            contentId={groupId}
            groupId={groupId}
          />
        ) : (
          <View>
            {getGroupMembers()}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: Constants.Colors.app_color,
  },
  activeTabText: { color: Constants.Colors.app_color, fontWeight: "600" },
});
