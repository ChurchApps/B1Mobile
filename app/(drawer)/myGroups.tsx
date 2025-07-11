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
import { useUser, useGroupViewCounts, useIncrementGroupViewCount } from "../../src/stores/useUserStore";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1", // Primary Blue from style guide
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
  const groupViewCounts = useGroupViewCounts();
  const incrementGroupViewCount = useIncrementGroupViewCount();

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

  const showGroups = useCallback(
    (item: any, isFeatured: boolean = false) => {
      const handlePress = () => {
        // Track the view
        incrementGroupViewCount(item.id);

        router.navigate({
          pathname: `/groupDetails/${item.id}`
        });
      };

      if (!isFeatured) {
        // Compact layout for regular groups
        return (
          <Card style={styles.regularGroupCard} onPress={handlePress}>
            <View style={styles.regularGroupContent}>
              <View style={styles.regularGroupImageContainer}>
                <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.regularGroupImage} />
              </View>
              <View style={styles.regularGroupTextContainer}>
                <Text variant="titleMedium" style={styles.regularGroupName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={styles.regularGroupSubtitle}>
                  Tap to explore
                </Text>
              </View>
            </View>
          </Card>
        );
      }

      // Featured layout (full-width 16:9)
      return (
        <Card style={styles.featuredGroupCard} onPress={handlePress}>
          <View style={styles.groupImageContainer}>
            <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.groupImage} />
            <View style={styles.groupOverlay}>
              <Text variant="headlineSmall" style={styles.featuredGroupName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text variant="bodyMedium" style={styles.groupSubtitle}>
                Most visited
              </Text>
            </View>
          </View>
        </Card>
      );
    },
    [incrementGroupViewCount]
  );

  const renderItems = useCallback((item: any) => <TimeLinePost item={item} onUpdate={loadData} />, [loadData]);

  // Sort groups by view count and separate into featured vs regular
  const sortedGroups = useMemo(() => {
    if (!Array.isArray(groups)) return { featured: [], regular: [] };

    // Sort groups by view count (descending)
    const sorted = [...groups].sort((a, b) => {
      const aViews = groupViewCounts[a.id] || 0;
      const bViews = groupViewCounts[b.id] || 0;
      return bViews - aViews;
    });

    // Split into featured (top 1-3) and regular
    const featuredCount = Math.min(3, Math.max(1, sorted.length));
    const featured = sorted.slice(0, featuredCount);
    const regular = sorted.slice(featuredCount);

    return { featured, regular };
  }, [groups, groupViewCounts]);

  const groupsGrid = useMemo(() => {
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const { featured, regular } = sortedGroups;

    return (
      <View style={styles.groupsSection}>
        {/* Featured Groups */}
        {featured.length > 0 && (
          <View style={styles.featuredSection}>
            <Text variant="titleMedium" style={styles.featuredTitle}>
              Your Most Visited
            </Text>
            <View style={styles.groupsList}>
              {featured.map(item => (
                <View key={item.id} style={styles.groupItem}>
                  {showGroups(item, true)}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Regular Groups */}
        {regular.length > 0 && (
          <View style={styles.regularSection}>
            <Text variant="titleMedium" style={styles.regularTitle}>
              Other Groups
            </Text>
            <View style={styles.regularGroupsList}>
              {regular.map(item => (
                <View key={item.id} style={styles.regularGroupItem}>
                  {showGroups(item, false)}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }, [sortedGroups, showGroups]);

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
  featuredSection: {
    marginBottom: 24
  },
  featuredTitle: {
    color: "#0D47A1",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 4
  },
  regularSection: {
    marginBottom: 16
  },
  regularTitle: {
    color: "#9E9E9E",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4
  },
  groupsList: {
    gap: 16
  },
  regularGroupsList: {
    gap: 12
  },
  groupItem: {
    width: "100%"
  },
  regularGroupItem: {
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
  featuredGroupCard: {
    overflow: "hidden",
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(21, 101, 192, 0.1)"
  },
  regularGroupCard: {
    overflow: "hidden",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  regularGroupContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center"
  },
  regularGroupImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12
  },
  regularGroupImage: {
    width: "100%",
    height: "100%"
  },
  regularGroupTextContainer: {
    flex: 1,
    justifyContent: "center"
  },
  regularGroupName: {
    color: "#3c3c3c",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  regularGroupSubtitle: {
    color: "#9E9E9E",
    fontSize: 12
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
  featuredGroupName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
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
