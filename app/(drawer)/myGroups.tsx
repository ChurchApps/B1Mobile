import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Provider as PaperProvider, Card, Text, MD3LightTheme } from "react-native-paper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { useQuery } from "@tanstack/react-query";
import { ArrayHelper, UserPostInterface } from "../../src/helpers";
import { TimelineHelper } from "../../src/helpers/Timelinehelper";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import TimeLinePost from "../../src/components/MyGroup/TimeLinePost";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUser, useGroupViewCounts, useIncrementGroupViewCount } from "../../src/stores/useUserStore";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useNavigation } from "../../src/hooks";

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

interface MyGroupsProps {
  from?: "stack" | "drawer";
}

const MyGroups = ({ from }: MyGroupsProps) => {
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([]);
  const navigation = useReactNavigation();
  const { navigateBack, router } = useNavigation();

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
      return timelineData.posts.map(item1 => {
        const value = {
          ...item1,
          ...ArrayHelper.getOne(timelineData.groups, "id", item1.groupId)
        };
        return { item: value };
      });
    }
    return [];
  }, [timelineData]);

  useEffect(() => {
    setMergedData(mergedTimelineData);
  }, [mergedTimelineData]);

  const showGroups = useCallback(
    (item: any, type: "hero" | "featured" | "regular" = "regular") => {
      const handlePress = () => {
        // Track the view
        incrementGroupViewCount(item.id);

        router.navigate({
          pathname: `/groupDetails/${item.id}`
        });
      };

      if (type === "hero") {
        // Hero layout (large full-width card like dashboard)
        return (
          <Card style={styles.heroCard} onPress={handlePress}>
            <View style={styles.heroImageContainer}>
              <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text variant="headlineLarge" style={styles.heroTitle}>
                  {item.name}
                </Text>
                <Text variant="bodyLarge" style={styles.heroSubtitle}>
                  Tap to explore
                </Text>
              </View>
            </View>
          </Card>
        );
      }

      if (type === "featured") {
        // Featured layout (side-by-side cards like dashboard)
        return (
          <Card style={styles.featuredCard} onPress={handlePress}>
            <View style={styles.featuredImageContainer}>
              <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("../../src/assets/images/dash_worship.png")} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <Text variant="titleMedium" style={styles.featuredTitle}>
                  {item.name}
                </Text>
              </View>
            </View>
          </Card>
        );
      }

      // Regular layout (compact list items)
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
    },
    [incrementGroupViewCount]
  );

  const renderItems = useCallback((item: any) => <TimeLinePost item={item} onUpdate={loadData} />, [loadData]);

  // Sort groups by view count and separate into hero, featured, and regular
  const sortedGroups = useMemo(() => {
    if (!Array.isArray(groups)) return { hero: null, featured: [], regular: [] };

    // Sort groups by view count (descending)
    const sorted = [...groups].sort((a, b) => {
      const aViews = groupViewCounts[a.id] || 0;
      const bViews = groupViewCounts[b.id] || 0;
      return bViews - aViews;
    });

    if (sorted.length === 0) return { hero: null, featured: [], regular: [] };

    // Split into hero (1st), featured (2nd and 3rd), and regular (rest)
    const hero = sorted[0];
    const featured = sorted.slice(1, 3);
    const regular = sorted.slice(3);

    return { hero, featured, regular };
  }, [groups, groupViewCounts]);

  const groupsGrid = useMemo(() => {
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const { hero, featured, regular } = sortedGroups;

    return (
      <View>
        {/* Hero Section */}
        {hero && <View style={styles.heroSection}>{showGroups(hero, "hero")}</View>}

        {/* Featured Groups */}
        {featured.length > 0 && (
          <View style={styles.featuredSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Featured
            </Text>
            <View style={styles.featuredGrid}>
              {featured.map(item => (
                <View key={item.id} style={styles.featuredItem}>
                  {showGroups(item, "featured")}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Other Groups */}
        {regular.length > 0 && (
          <View style={styles.regularSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Other Groups
            </Text>
            <View style={styles.regularGroupsList}>
              {regular.map(item => (
                <View key={item.id} style={styles.regularGroupItem}>
                  {showGroups(item, "regular")}
                </View>
              ))}
            </View>
          </View>
        )}
        {mergeData.length > 0 && (
          <View style={styles.regularSectionTop}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Latest Updates
            </Text>
          </View>
        )}
      </View>
    );
  }, [sortedGroups, showGroups, mergeData]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={loading}>
          <View style={styles.container}>
            <MainHeader title="My Groups" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />
            <View style={styles.contentContainer}>
              <FlatList data={mergeData} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} scrollEnabled={true} ListHeaderComponent={() => <View style={styles.groupsContainer}>{groupsGrid}</View>} renderItem={({ item }) => renderItems(item)} keyExtractor={() => `key-${Math.random()}`} initialNumToRender={8} windowSize={10} removeClippedSubviews={true} maxToRenderPerBatch={5} updateCellsBatchingPeriod={100} />
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
    paddingBottom: 30
  },
  groupsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#F6F6F8"
  },
  groupsSection: {
    marginBottom: 16
  },

  // Hero Section (matching dashboard)
  heroSection: {
    marginBottom: 24
  },
  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: "#FFFFFF"
  },
  heroImageContainer: {
    height: 200,
    position: "relative"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },

  // Featured Section (matching dashboard)
  featuredSection: {
    marginBottom: 24
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 16,
    paddingLeft: 4
  },
  featuredGrid: {
    flexDirection: "row",
    gap: 12
  },
  featuredItem: {
    flex: 1
  },
  featuredCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFFFFF"
  },
  featuredImageContainer: {
    height: 120,
    position: "relative"
  },
  featuredImage: {
    width: "100%",
    height: "100%"
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },

  // Regular Section
  regularSection: {
    marginBottom: 16
  },
  regularSectionTop: {
    marginTop: 8
  },
  regularGroupsList: {
    gap: 12
  },
  regularGroupItem: {
    width: "100%"
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
