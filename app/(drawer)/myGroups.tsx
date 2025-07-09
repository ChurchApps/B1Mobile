import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Provider as PaperProvider, Appbar, Card, Text, MD3LightTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { ArrayHelper, UserPostInterface } from "../../src/helpers";
import { TimelineHelper } from "../../src/helpers/Timelinehelper";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import TimeLinePost from "../../src/components/MyGroup/TimeLinePost";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUser, useCurrentUserChurch } from "../../src/stores/useUserStore";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#175ec1",
    secondary: "#f0f2f5",
    surface: "#ffffff",
    background: "#f8f9fa",
    elevation: {
      level0: "transparent",
      level1: "#ffffff",
      level2: "#f8f9fa",
      level3: "#f0f2f5",
      level4: "#e9ecef",
      level5: "#e2e6ea"
    }
  }
};

interface Group {
  id: string;
  name: string;
  photoUrl?: string;
  description?: string;
}

const MyGroups = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([]);

  const user = useUser();
  const currentUserChurch = useCurrentUserChurch();

  // Debug logging
  console.log("👥 MyGroups - user:", user ? "Present" : "Missing");
  console.log("👥 MyGroups - user JWT:", user?.jwt ? "Present" : "Missing");
  console.log("👥 MyGroups - currentUserChurch:", currentUserChurch ? "Present" : "Missing");

  // Use react-query for groups data
  const {
    data: groups = [],
    isLoading: groupsLoading,
    refetch: refetchGroups
  } = useQuery<Group[]>({
    queryKey: ["/groups/my", "MembershipApi"],
    enabled: !!user?.jwt, // Only run when authenticated
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Use react-query for timeline data
  const {
    data: timelineData,
    isLoading: timelineLoading,
    refetch: refetchTimeline
  } = useQuery({
    queryKey: ["timeline", "user"],
    queryFn: async () => {
      const { posts, groups } = await TimelineHelper.loadForUser();
      return { posts, groups };
    },
    enabled: !!user?.jwt, // Only run when authenticated
    placeholderData: { posts: [], groups: [] },
    staleTime: 0, // Instant stale - timeline includes real-time conversations
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

  const loading = groupsLoading || timelineLoading;

  const loadData = async () => {
    await Promise.all([refetchGroups(), refetchTimeline()]);
  };

  useEffect(() => {
    if (timelineData?.posts?.length > 0 && timelineData?.groups?.length > 0) {
      const combined = timelineData.posts.map(item1 => ({
        ...item1,
        ...ArrayHelper.getOne(timelineData.groups, "id", item1.groupId)
      }));
      setMergedData(combined);
    }
  }, [timelineData]);

  const showGroups = (item: any) => (
    <Card
      style={styles.groupCard}
      onPress={() => {
        router.navigate({
          pathname: `/groupDetails/${item.id}`
        });
      }}>
      <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.groupImage} />
      <Card.Content style={styles.groupContent}>
        <Text variant="titleMedium" style={styles.groupName}>
          {item.name}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderItems = (item: any) => <TimeLinePost item={item} onUpdate={loadData} />;

  const getGroupsGrid = () => {
    if (!Array.isArray(groups)) return null;
    return (
      <View style={styles.gridContainer}>
        {groups.map(item => (
          <View key={item.id} style={styles.gridItem}>
            {showGroups(item)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={loading}>
          <View style={styles.container}>
            <Appbar.Header style={styles.header} mode="center-aligned">
              <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} color="white" />
              <Appbar.Content title="My Groups" titleStyle={styles.headerTitle} />
            </Appbar.Header>
            <View style={styles.contentContainer}>
              <FlatList data={mergeData} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} scrollEnabled={true} ListFooterComponent={() => <View style={styles.groupsContainer}>{getGroupsGrid()}</View>} renderItem={({ item }) => renderItems(item)} keyExtractor={(item: any) => `key-${item.id || Math.random()}`} />
            </View>
          </View>
        </LoadingWrapper>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary
  },
  header: {
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600"
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  listContent: {
    paddingBottom: 20
  },
  groupsContainer: {
    padding: 16
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8
  },
  gridItem: {
    width: "48%",
    marginBottom: 16
  },
  groupCard: {
    height: 160,
    overflow: "hidden",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  groupImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  groupContent: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "white"
  },
  groupName: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  }
});

export default MyGroups;
