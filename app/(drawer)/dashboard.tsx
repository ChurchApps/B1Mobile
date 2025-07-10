import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { Provider as PaperProvider, Card, Text, Surface, MD3LightTheme, Portal, Modal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { UserHelper } from "../../src/helpers";
import { NavigationUtils } from "../../src/helpers/NavigationUtils";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { LinkInterface } from "../../src/helpers/Interfaces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { NotificationTab } from "../../src/components/NotificationView";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { updateCurrentScreen } from "../../src/helpers/PushNotificationHelper";
import { useUserStore, useCurrentChurch, useChurchAppearance } from "../../src/stores/useUserStore";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const navigation = useNavigation();

  const currentChurch = useCurrentChurch();
  const churchAppearance = useChurchAppearance();
  const { links } = useUserStore();

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

  const getButton = useCallback(
    (item: LinkInterface) => {
      if (item.linkType === "separator") return null;

      const backgroundImage = getBackgroundImage(item);

      const handlePress = () => NavigationUtils.navigateToScreen(item, currentChurch);

      return (
        <Card key={`card-${item.id || item.linkType + item.text}`} style={styles.card} mode="elevated" onPress={handlePress}>
          <View style={styles.cardImage}>
            <OptimizedImage source={backgroundImage} style={styles.cardImageInner} contentFit="cover" />
          </View>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardText}>
              {item.text}
            </Text>
          </Card.Content>
        </Card>
      );
    },
    [currentChurch, getBackgroundImage]
  );

  const filteredLinks = useMemo(() => {
    if (!Array.isArray(links)) return [];
    return links.filter(item => item.linkType !== "separator");
  }, [links]);

  const buttonsGrid = useMemo(() => {
    if (isLoading || filteredLinks.length === 0) return null;
    return (
      <View style={styles.gridContainer}>
        {filteredLinks.map(item => (
          <View key={item.id || item.linkType + item.text} style={styles.gridItem}>
            {getButton(item)}
          </View>
        ))}
      </View>
    );
  }, [isLoading, filteredLinks, getButton]);

  const brandContent = useMemo(() => {
    if (churchAppearance?.logoLight) {
      return <OptimizedImage source={{ uri: churchAppearance.logoLight }} style={styles.logo} contentFit="contain" priority="high" />;
    }
    return (
      <Text variant="headlineMedium" style={styles.churchName}>
        {currentChurch?.name || ""}
      </Text>
    );
  }, [churchAppearance?.logoLight, currentChurch?.name]);

  const handleNotificationToggle = useCallback(() => {
    setShowNotifications(true);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.container}>
            <MainHeader 
              title="Home" 
              openDrawer={handleDrawerOpen}
            />
            <View style={styles.contentContainer}>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.brandContainer} elevation={1}>
                  {brandContent}
                </Surface>
                {buttonsGrid}
              </ScrollView>
            </View>
            <Portal>
              <Modal visible={showNotifications} onDismiss={() => setShowNotifications(false)} contentContainerStyle={styles.modalContainer}>
                <NotificationTab />
              </Modal>
            </Portal>
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
    backgroundColor: "#f8f9fa"
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  brandContainer: {
    margin: 16,
    padding: 16,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  logo: {
    width: "100%",
    height: DimensionHelper.wp(25),
    resizeMode: "contain"
  },
  churchName: {
    textAlign: "center",
    marginTop: 8,
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "600"
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "space-between"
  },
  gridItem: {
    width: "48%",
    marginBottom: 16
  },
  card: {
    height: 160,
    overflow: "hidden",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  cardImageInner: {
    width: "100%",
    height: "100%"
  },
  cardContent: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "white"
  },
  cardText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500"
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    height: "80%",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  }
});

export default Dashboard;
