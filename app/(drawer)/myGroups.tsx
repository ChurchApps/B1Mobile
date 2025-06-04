import React from 'react';
import { ImageButton, } from "@/src/components/ImageButton";
// Loader is used by LoadingWrapper
import TimeLinePost from "@/src/components/MyGroup/TimeLinePost"; // Custom component
import { MainHeader } from "@/src/components/wrapper/MainHeader";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { ApiHelper, ArrayHelper, PersonInterface, TimelinePostInterface, UserPostInterface, globalStyles } from "@/src/helpers";
import { TimelineHelper } from "@/src/helpers/Timelinehelper";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, View, StyleSheet } from "react-native"; // Text removed
// MaterialCommunityIcons import seems unused
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';

const MyGroups = (props: any) => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [groups, setGroups] = useState<any[]>([]); // Typed groups
  const [userPosts, setUserPosts] = useState<TimelinePostInterface[]>([]); // Renamed UserPost
  const [loading, setLoading] = useState(false);
  // people state seems unused, remove if confirmed
  // const [people, setPeople] = useState<PersonInterface[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]); // Renamed UserGroups
  const [mergedData, setMergedData] = useState<UserPostInterface[]>([]); // Renamed mergeData

  const loadUserData = async () => { // Renamed LoadUserData
    setLoading(true);
    try {
      const { posts, people, groups: fetchedGroups } = await TimelineHelper.loadForUser(); // Destructured groups to fetchedGroups
      setUserPosts(posts);
      setUserGroups(fetchedGroups); // Use fetchedGroups
      // setPeople(people); // If people is indeed unused
      if (posts.length === 0) {
        console.log("no timeline data found");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupsData = async () => { // Renamed loadData to be more specific
    try {
      const data = await ApiHelper.get("/groups/my", "MembershipApi");
      setGroups(data || []); // Ensure groups is an array
    } catch (error) {
      console.error("Error loading groups data:", error);
      setGroups([]); // Set to empty array on error
    }
    loadUserData(); // Load user timeline data after groups
  };

  useEffect(() => {
    if (ApiHelper.isAuthenticated) { // Check if authenticated before loading
      loadGroupsData();
    }
  }, [ApiHelper.isAuthenticated]); // Rerun if auth state changes

  useEffect(() => {
    if (userPosts.length > 0 && userGroups.length > 0) {
      const combined = userPosts.map((item1) => ({ // item1 had no index prop used
        ...item1,
        ...ArrayHelper.getOne(userGroups, "id", item1.groupId),
      }));
      setMergedData(combined);
    } else if (userPosts.length > 0 && userGroups.length === 0) {
      // If there are posts but no group info (e.g. groups call failed or returned empty)
      // Still show posts, group name will be undefined from the spread
      setMergedData(userPosts.map(p => ({...p})));
    } else {
      setMergedData([]); // Clear if no posts or groups
    }
  }, [userPosts, userGroups]);

  // const brandColor = '#175ec1'; // Unused, ImageButton color is hardcoded to #fff

  const showGroups = (item: any) => { // topItem unused
    return (
      <ImageButton
        icon={null} // icon prop was null
        text={item.name}
        onPress={() => {
          router.navigate({
            pathname: '/groupDetails',
            params: { group: JSON.stringify(item) }
          });
        }}
        backgroundImage={item.photoUrl ? { uri: item.photoUrl } : require('@/src/assets/images/dash_worship.png')}
        color={theme.colors.surface} // Use a theme color that contrasts with dark image/overlay.
                                     // If ImageButton's text is always on a dark overlay, this should be a light color.
                                     // Assuming ImageButton refactor handles text color based on its background.
      />
    );
  };

  const renderTimelineItem = ({ item }: { item: UserPostInterface }) => { // Typed item for renderItem
    return (
      <TimeLinePost item={item} onUpdate={loadGroupsData} /> // Pass loadGroupsData to onUpdate
    );
  };

  const getGroupsGrid = () => {
    if (!Array.isArray(groups) || groups.length === 0) return null;
    const rows = [];
    for (let i = 0; i < groups.length; i += 2) {
      rows.push(groups.slice(i, i + 2));
    }
    return (
      <View style={localStyles.groupsGridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={localStyles.row}>
            {row.map((item, colIndex) => (
              <View key={item.id || colIndex} style={localStyles.buttonWrapper}> {/* Use item.id for key */}
                {showGroups(item)}
              </View>
            ))}
            {/* Add a spacer view if there's only one item in the last row */}
            {row.length === 1 && <View style={localStyles.buttonWrapper} />}
          </View>
        ))}
      </View>
    );
  };

  // const getGroups = () => { // This function is just a wrapper, can inline getGroupsGrid
  //   return getGroupsGrid();
  // };

  return (
    <LoadingWrapper loading={loading}>
      <LinearGradient
        colors={['#F8F9FA', '#F0F2F5']} // Consider theming these
        style={localStyles.gradientContainer}
      >
        <SafeAreaView style={[localStyles.container, { backgroundColor: theme.colors.background }]}>
          <MainHeader title="My Groups" openDrawer={navigation.openDrawer} />
          <FlatList
            data={mergedData}
            contentContainerStyle={globalStyles.FlatListStyle} // Review this globalStyle
            showsVerticalScrollIndicator={false}
            // scrollEnabled={true} // Default true, not needed unless explicitly set false elsewhere
            ListFooterComponent={() => (
              // Review globalStyles.webViewContainer for background etc.
              <View style={[globalStyles.webViewContainer, {backgroundColor: 'transparent'}]}>{getGroupsGrid()}</View>
            )}
            renderItem={renderTimelineItem}
            keyExtractor={(item: UserPostInterface, index: number) => item.postId || `key-${index}`} // Use postId or fallback
            ListEmptyComponent={!loading ? <View><PaperText style={{textAlign:'center', padding:20}}>No timeline posts available.</PaperText></View> : null}
          />
        </SafeAreaView>
      </LinearGradient>
    </LoadingWrapper>
  );
};

const localStyles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignSelf: "center", // Kept from original
    width: '100%' // Kept from original
  },
  groupsGridContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 0, // Not needed if width is set
    width: '48%',
  }
});

export default MyGroups;
