import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Provider as PaperProvider, Appbar, Card, Text, MD3LightTheme } from "react-native-paper";
import { ApiHelper, ArrayHelper, TimelinePostInterface, UserPostInterface } from "@/src/helpers";
import { TimelineHelper } from "@/src/helpers/Timelinehelper";
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import TimeLinePost from "@/src/components/MyGroup/TimeLinePost";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [UserPost, setUserPost] = useState<TimelinePostInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [UserGroups, setUserGroups] = useState<any[]>([]);
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([]);

  const LoadUserData = async () => {
    setLoading(true);
    try {
      const { posts, people, groups } = await TimelineHelper.loadForUser();
      setUserPost(posts);
      setUserGroups(groups);
      if (posts.length == 0) {
        console.log("no data found");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

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
        ...ArrayHelper.getOne(UserGroups, "id", item1.groupId)
      }));
      setMergedData(combined);
    }
  }, [UserPost, UserGroups]);

  const showGroups = (item: any) => (
    <Card
      style={styles.groupCard}
      onPress={() => {
        router.navigate({
          pathname: `/groupDetails/${item.id}`
        });
      }}>
      <Card.Cover source={item.photoUrl ? { uri: item.photoUrl } : require("@/src/assets/images/dash_worship.png")} style={styles.groupImage} />
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
        {groups.map((item, index) => (
          <View key={item.id || index} style={styles.gridItem}>
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
              <FlatList
                data={mergeData}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                ListFooterComponent={() => <View style={styles.groupsContainer}>{getGroupsGrid()}</View>}
                renderItem={({ item }) => renderItems(item)}
                keyExtractor={(item: any, index: number) => `key-${index}`}
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
