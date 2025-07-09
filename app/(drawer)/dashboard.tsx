import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Provider as PaperProvider, Appbar, Card, Text, Surface, MD3LightTheme, Portal, Modal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { UserHelper } from "../../src/helpers";
import { NavigationUtils } from "../../src/helpers/NavigationUtils";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { LinkInterface } from "../../src/helpers/Interfaces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { HeaderBell } from "../../src/components/wrapper/HeaderBell";
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

  const checkRedirect = () => {
    if (!currentChurch) router.navigate("/(drawer)/churchSearch");
  };

  const getButton = (item: LinkInterface) => {
    if (item.linkType === "separator") return null;
    let backgroundImage = item.photo ? { uri: item.photo } : item.linkType.toLowerCase() === "groups" ? require("../../src/assets/images/dash_worship.png") : item.linkType.toLowerCase() === "bible" ? require("../../src/assets/images/dash_bible.png") : item.linkType.toLowerCase() === "votd" ? require("../../src/assets/images/dash_votd.png") : item.linkType.toLowerCase() === "lessons" ? require("../../src/assets/images/dash_lessons.png") : item.linkType.toLowerCase() === "checkin" ? require("../../src/assets/images/dash_checkin.png") : item.text.toLowerCase() === "chums" ? require("../../src/assets/images/dash_chums.png") : item.linkType.toLowerCase() === "donation" ? require("../../src/assets/images/dash_donation.png") : item.linkType.toLowerCase() === "directory" ? require("../../src/assets/images/dash_directory.png") : item.linkType.toLowerCase() === "plans" ? require("../../src/assets/images/dash_votd.png") : require("../../src/assets/images/dash_url.png");

    return (
      <Card key={`card-${item.id || item.linkType + item.text}`} style={styles.card} mode="elevated" onPress={() => NavigationUtils.navigateToScreen(item, currentChurch)}>
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
  };

  const getButtons = () => {
    if (isLoading) return null;
    if (!Array.isArray(links)) return null;
    const items = links.filter(item => item.linkType !== "separator");
    return (
      <View style={styles.gridContainer}>
        {items.map(item => (
          <View key={item.id || item.linkType + item.text} style={styles.gridItem}>
            {getButton(item)}
          </View>
        ))}
      </View>
    );
  };

  const getBrand = () => {
    if (churchAppearance?.logoLight) {
      return <OptimizedImage source={{ uri: churchAppearance.logoLight }} style={styles.logo} contentFit="contain" priority="high" />;
    }
    return (
      <Text variant="headlineMedium" style={styles.churchName}>
        {currentChurch?.name || ""}
      </Text>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.container}>
            <Appbar.Header style={styles.header} mode="center-aligned">
              <Appbar.Action icon={() => <MaterialIcons name="dehaze" size={24} color="#FFFFFF" />} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
              <Appbar.Content title="Home" titleStyle={styles.headerTitle} />
              <View style={styles.bellContainer}>
                <View style={styles.bellWrapper}>
                  <HeaderBell toggleNotifications={() => setShowNotifications(true)} />
                </View>
              </View>
            </Appbar.Header>
            <View style={styles.contentContainer}>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.brandContainer} elevation={1}>
                  {getBrand()}
                </Surface>
                {getButtons()}
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
  bellContainer: {
    marginRight: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  bellWrapper: {
    transform: [{ scale: 1.2 }],
    opacity: 0.9
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
