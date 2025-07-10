import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { Provider as PaperProvider, Card, Text, MD3LightTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { UserHelper } from "../../src/helpers";
import { NavigationUtils } from "../../src/helpers/NavigationUtils";
import { LinkInterface } from "../../src/helpers/Interfaces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { updateCurrentScreen } from "../../src/helpers/PushNotificationHelper";
import { useUserStore, useCurrentChurch, useChurchAppearance, useLinkViewCounts, useIncrementLinkViewCount } from "../../src/stores/useUserStore";

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

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const navigation = useNavigation();

  const currentChurch = useCurrentChurch();
  const churchAppearance = useChurchAppearance();
  const { links } = useUserStore();
  const linkViewCounts = useLinkViewCounts();
  const incrementLinkViewCount = useIncrementLinkViewCount();

  // Debug logging

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {});
    UserHelper.addOpenScreenEvent("Dashboard");
    updateCurrentScreen("/(drawer)/dashboard");
    loadDashboardData();
    return () => {
      subscription.remove();
      updateCurrentScreen("");
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Wait for links to be available
      if (!links || links.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Give time for links to load
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkRedirect();
      loadDashboardData();
    }, [])
  );

  const checkRedirect = useCallback(() => {
    if (!currentChurch) router.navigate("/(drawer)/churchSearch");
  }, [currentChurch]);

  const getBackgroundImage = useCallback((item: LinkInterface) => {
    if (item.photo) return { uri: item.photo };

    const imageMap: { [key: string]: any } = {
      groups: require("../../src/assets/images/dash_worship.png"),
      bible: require("../../src/assets/images/dash_bible.png"),
      votd: require("../../src/assets/images/dash_votd.png"),
      lessons: require("../../src/assets/images/dash_lessons.png"),
      checkin: require("../../src/assets/images/dash_checkin.png"),
      donation: require("../../src/assets/images/dash_donation.png"),
      directory: require("../../src/assets/images/dash_directory.png"),
      plans: require("../../src/assets/images/dash_votd.png")
    };

    if (item.text.toLowerCase() === "chums") {
      return require("../../src/assets/images/dash_chums.png");
    }

    return imageMap[item.linkType.toLowerCase()] || require("../../src/assets/images/dash_url.png");
  }, []);

  const generateLinkId = useCallback((item: LinkInterface) => item.id || `${item.linkType}_${item.text}`, []);

  const handleLinkPress = useCallback(
    (item: LinkInterface) => {
      const linkId = generateLinkId(item);
      incrementLinkViewCount(linkId);
      NavigationUtils.navigateToScreen(item, currentChurch);
    },
    [generateLinkId, incrementLinkViewCount, currentChurch]
  );

  const filteredLinks = useMemo(() => {
    if (!Array.isArray(links)) return [];

    const filtered = links.filter(item => item.linkType !== "separator");

    // Sort by view count (most visited first), then by original order
    return filtered.sort((a, b) => {
      const aId = generateLinkId(a);
      const bId = generateLinkId(b);
      const aCount = linkViewCounts[aId] || 0;
      const bCount = linkViewCounts[bId] || 0;

      // If view counts are equal, maintain original order
      if (aCount === bCount) {
        return filtered.indexOf(a) - filtered.indexOf(b);
      }

      return bCount - aCount; // Sort by view count descending
    });
  }, [links, linkViewCounts, generateLinkId]);

  const featuredContent = useMemo(() => {
    if (isLoading || filteredLinks.length === 0) return null;

    // Get featured items (first 3 most important items)
    const featuredItems = filteredLinks.slice(0, 3);
    const otherItems = filteredLinks.slice(3);

    return (
      <>
        {/* Hero Section */}
        {featuredItems.length > 0 && (
          <View style={styles.heroSection}>
            <Card style={styles.heroCard} mode="elevated" onPress={() => handleLinkPress(featuredItems[0])}>
              <View style={styles.heroImageContainer}>
                <OptimizedImage source={getBackgroundImage(featuredItems[0])} style={styles.heroImage} contentFit="cover" />
                <View style={styles.heroOverlay}>
                  <Text variant="headlineLarge" style={styles.heroTitle}>
                    {featuredItems[0].text}
                  </Text>
                  <Text variant="bodyLarge" style={styles.heroSubtitle}>
                    Tap to explore
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Featured Cards */}
        {featuredItems.length > 1 && (
          <View style={styles.featuredSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Featured
            </Text>
            <View style={styles.featuredGrid}>
              {featuredItems.slice(1, 3).map(item => (
                <Card key={generateLinkId(item)} style={styles.featuredCard} mode="elevated" onPress={() => handleLinkPress(item)}>
                  <View style={styles.featuredImageContainer}>
                    <OptimizedImage source={getBackgroundImage(item)} style={styles.featuredImage} contentFit="cover" />
                    <View style={styles.featuredOverlay}>
                      <Text variant="titleMedium" style={styles.featuredTitle}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {otherItems.length > 0 && (
          <View style={styles.quickActionsSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              {otherItems.map(item => (
                <TouchableOpacity key={generateLinkId(item)} style={styles.quickActionItem} onPress={() => handleLinkPress(item)}>
                  <View style={styles.quickActionIcon}>
                    <MaterialIcons name={item.icon ? item.icon.split("_").join("-") : "apps"} size={24} color="#1565C0" />
                  </View>
                  <Text variant="bodyMedium" style={styles.quickActionText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </>
    );
  }, [isLoading, filteredLinks, getBackgroundImage, handleLinkPress, generateLinkId]);

  const welcomeSection = useMemo(
    () => (
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text variant="headlineMedium" style={styles.welcomeTitle}>
            Welcome to
          </Text>
          {churchAppearance?.logoLight ? (
            <OptimizedImage source={{ uri: churchAppearance.logoLight }} style={styles.churchLogo} contentFit="contain" priority="high" />
          ) : (
            <Text variant="headlineLarge" style={styles.churchName}>
              {currentChurch?.name || ""}
            </Text>
          )}
          <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
            Stay connected with your church community
          </Text>
        </View>
      </View>
    ),
    [churchAppearance?.logoLight, currentChurch?.name]
  );

  const handleDrawerOpen = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.container}>
            <MainHeader title="Home" openDrawer={handleDrawerOpen} />
            <View style={styles.contentContainer}>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {welcomeSection}
                {featuredContent}
              </ScrollView>
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
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24
  },

  // Welcome Section
  welcomeSection: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 16
  },
  welcomeContent: {
    alignItems: "center"
  },
  welcomeTitle: {
    color: "#9E9E9E",
    marginBottom: 8,
    fontWeight: "400"
  },
  churchLogo: {
    width: "70%",
    height: 80,
    marginBottom: 12
  },
  churchName: {
    color: "#1565C0",
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center"
  },
  welcomeSubtitle: {
    color: "#3c3c3c",
    textAlign: "center",
    opacity: 0.8
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8
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
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
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

  // Featured Section
  featuredSection: {
    paddingHorizontal: 16,
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
  featuredCard: {
    flex: 1, // Back to 2 equal cards side by side
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4
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

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  quickActionItem: {
    width: "22%",
    minWidth: 70,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  quickActionText: {
    color: "#3c3c3c",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500"
  }
});

export default Dashboard;
