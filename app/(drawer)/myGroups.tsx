import React from 'react';
import { ImageButton, } from "@/src/components/ImageButton";
import { Loader } from "@/src/components/Loader";
import TimeLinePost from "@/src/components/MyGroup/TimeLinePost";
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { ApiHelper, ArrayHelper, PersonInterface, TimelinePostInterface, UserPostInterface, globalStyles } from "@/src/helpers";
import { TimelineHelper } from "@/src/helpers/Timelinehelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MyGroups = (props: any) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [groups, setGroups] = useState([]);
  const [UserPost, setUserPost] = useState<TimelinePostInterface[]>([])
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<PersonInterface[]>([]);
  const [UserGroups, setUserGroups] = useState<any[]>([]);
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([])

  const LoadUserData = async () => {
    setLoading(true);
    try {
      const { posts, people, groups } = await TimelineHelper.loadForUser();
      setUserPost(posts)
      setUserGroups(groups)
      setPeople(people)
      if (posts.length == 0) {
        console.log("no data found")
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }

  const loadData = async () => {
    const data = await ApiHelper.get("/groups/my", "MembershipApi");
    setGroups(data);
    LoadUserData();
  };

  useEffect(() => {
    loadData();
  }, [ApiHelper.isAuthenticated]);

  useEffect(() => {
    if (UserPost.length > 0 && UserGroups.length > 0) {
      const combined = UserPost.map((item1, index) => ({
        ...item1,
        ...ArrayHelper.getOne(UserGroups, "id", item1.groupId),
      })
      );
      setMergedData(combined);
    }
  }, [UserPost, UserGroups])

  const brandColor = '#175ec1';

  const showGroups = (topItem: boolean, item: any) => {
    return (
      <ImageButton
        icon={null}
        text={item.name}
        onPress={() => {
          router.navigate({
            pathname: '/groupDetails',
            params: { group: JSON.stringify(item) }
          })
        }}
        backgroundImage={item.photoUrl ? { uri: item.photoUrl } : require('@/src/assets/images/dash_worship.png')}
        color="#fff"
      />
    );
  };

  const renderItems = (item: any) => {
    return (
      <TimeLinePost item={item} onUpdate={loadData} />
    )
  }

  const getGroupsGrid = () => {
    if (!Array.isArray(groups)) return null;
    const rows = [];
    for (let i = 0; i < groups.length; i += 2) {
      rows.push(groups.slice(i, i + 2));
    }
    return (
      <View style={{ marginTop: 16, paddingHorizontal: 12 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 12, justifyContent: 'space-between' }}>
            {row.map((item, colIndex) => (
              <View key={colIndex} style={{ flex: 0, width: '48%' }}>
                {showGroups(false, item)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const getGroups = () => {
    return getGroupsGrid();
  };

  return (
    <LoadingWrapper loading={loading}>
      <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
        <MainHeader title="My Groups" openDrawer={navigation.openDrawer} back={navigation.goBack} />
        <FlatList
          data={mergeData}
          contentContainerStyle={globalStyles.FlatListStyle}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListFooterComponent={() => (
            <View style={globalStyles.webViewContainer}>{getGroups()}</View>
          )}
          renderItem={item => renderItems(item)}
          keyExtractor={(item: any, index: number) => `key-${index}`}
        />
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default MyGroups;
