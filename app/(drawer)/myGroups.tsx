import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Provider as PaperProvider, Card, Text, MD3LightTheme } from "react-native-paper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { useQuery } from "@tanstack/react-query";
import { ArrayHelper, UserPostInterface } from "../../src/helpers";
import { TimelineHelper } from "../../src/helpers/Timelinehelper";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import TimeLinePost from "../../src/components/MyGroup/TimeLinePost";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUser } from "../../src/stores/useUserStore";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1565C0", // Primary Blue from style guide
    secondary: "#F6F6F8", // Background from style guide
    surface: "#FFFFFF", // Card Background from style guide
    background: "#F6F6F8", // Background from style guide
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
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
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([]);
  const navigation = useNavigation();

  const user = useUser();

  // Debug logging

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

  const mergedTimelineData = useMemo(() => {
    if (timelineData?.posts?.length && timelineData?.groups?.length && timelineData.posts.length > 0 && timelineData.groups.length > 0) {
      return timelineData.posts.map(item1 => ({
        ...item1,
        ...ArrayHelper.getOne(timelineData.groups, "id", item1.groupId)
      }));
    }
    return [];
  }, [timelineData]);

  useEffect(() => {
    setMergedData(mergedTimelineData);
  }, [mergedTimelineData]);

  const showGroups = useCallback((item: any) => {
    const handlePress = () => {
      router.navigate({
        pathname: `/groupDetails/${item.id}`
      });
    };

    return (
      <Card style={styles.groupCard} onPress={handlePress}>
        <View style={styles.groupImageContainer}>
          <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.groupImage} />
          <View style={styles.groupOverlay}>
            <Text variant="headlineSmall" style={styles.groupName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.groupSubtitle}>
              Tap to explore
            </Text>
          </View>
        </View>
      </Card>
    );
  }, []);

  const renderItems = useCallback((item: any) => <TimeLinePost item={item} onUpdate={loadData} />, [loadData]);

  const groupsGrid = useMemo(() => {
    if (!Array.isArray(groups)) return null;
    return (
      <View style={styles.groupsSection}>
        <View style={styles.groupsList}>
          {groups.map(item => (
            <View key={item.id} style={styles.groupItem}>
              {showGroups(item)}
            </View>
          ))}
        </View>
      </View>
    );
  }, [groups, showGroups]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={loading}>
          <View style={styles.container}>
            <MainHeader title="My Groups" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.navigate("/(drawer)/dashboard")} />
            <View style={styles.contentContainer}>
              <FlatList
                data={mergeData}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                ListHeaderComponent={() => <View style={styles.groupsContainer}>{groupsGrid}</View>}
                ListFooterComponent={() =>
                  mergeData.length > 0 && (
                    <View style={styles.timelineSeparator}>
                      <Text variant="titleMedium" style={styles.timelineTitle}>
                        Recent Activity
                      </Text>
                    </View>
                  )
                }
                renderItem={({ item }) => renderItems(item)}
                keyExtractor={(item: any) => `key-${item.id || Math.random()}`}
                initialNumToRender={8}
                windowSize={10}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={100}
              />
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
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24
  },
  groupsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#F6F6F8"
  },
  groupsSection: {
    marginBottom: 16
  },
  groupsList: {
    gap: 16
  },
  groupItem: {
    width: "100%"
  },
  groupCard: {
    overflow: "hidden",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    backgroundColor: "#FFFFFF"
  },
  groupImageContainer: {
    position: "relative",
    aspectRatio: 16 / 9, // 16:9 aspect ratio
    overflow: "hidden"
  },
  groupImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16
  },
  groupOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  },
  groupName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  groupSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  timelineSeparator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F6F6F8"
  },
  timelineTitle: {
    color: "#3c3c3c",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center"
  }
});

export default MyGroups;
