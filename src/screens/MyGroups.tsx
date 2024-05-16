import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { Loader, MainHeader } from "../components";
import { ImageButton, } from "../components/ImageButton";
import TimeLinePost from "../components/MyGroup/TimeLinePost";
import { ApiHelper, ArrayHelper, PersonInterface, TimelinePostInterface, UserPostInterface, globalStyles } from "../helpers";
import { TimelineHelper } from "../helpers/Timelinehelper";

const MyGroups = (props: any) => {
  const [groups, setGroups] = useState([]);
  const [UserPost, setUserPost] = useState<TimelinePostInterface[]>([])
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = React.useState<PersonInterface[]>([]);
  const [UserGroups, setUserGroups] = React.useState<any[]>([]);
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([])

  const LoadUserData = async () => {
    setLoading(true);
    try{
      const { posts, people, groups } = await TimelineHelper.loadForUser();
      setUserPost(posts)
      setUserGroups(groups)
      setPeople(people)
      if(posts.length==0){
        console.log("no data found")
      }
    }catch (error) {
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
    if(UserPost.length > 0 && UserGroups.length > 0) { 
        const combined = UserPost.map((item1, index) => ({
              ...item1,
              ...ArrayHelper.getOne(UserGroups, "id", item1.groupId), 
            })
          );
          setMergedData(combined);
      }
  },[UserPost, UserGroups])
  console.log("user post is -------->", mergeData)
  const showGroups = (topItem: boolean, item: any) => {
    return (
      <View style={{ marginHorizontal: 10 }}>
        <ImageButton image={{ uri: item.photoUrl }} text={item.name} onPress={() => props.navigation.navigate('GroupDetails', { group: item })} />
      </View>
    );
  };

  const renderItems = (item: any) => {
    return (
      <TimeLinePost item={item} onUpdate={loadData}/>
    )
  }

  const getGroups = () => {
    return (<FlatList data={groups} contentContainerStyle={{ marginTop: 15 }} renderItem={({ item }) => showGroups(false, item)} keyExtractor={(item: any) => item.id} />);
  };

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
      <MainHeader title="My Groups" openDrawer={props.navigation.openDrawer} />

      {loading ? <Loader isLoading={loading} /> :
        <FlatList data={mergeData}
          contentContainerStyle={globalStyles.FlatListStyle}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListHeaderComponent={() => (
                                  <View style={globalStyles.TimeLineTitleView}>
                                    <Text style={[globalStyles.eventTextStyle, globalStyles.LatestUpdateTextStyle]}>{mergeData && mergeData.length>0  ? 'Latest Updates' : 'My Group'}</Text>
                                  </View>
          )}
          ListFooterComponent={() =>(
                              <View style={globalStyles.webViewContainer}>{getGroups()}</View>
          )}
          renderItem={item => renderItems(item)}
          keyExtractor={(item: any, index: number) => `key-${index}`}
        
        />
      }
    </SafeAreaView>
  );
};
export default MyGroups;