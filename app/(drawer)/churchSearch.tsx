import React from "react";
import { ArrayHelper, ChurchInterface, Constants, UserHelper } from "../../src/helpers";
import { ErrorHelper } from "../../src/mobilehelper";
import { ApiHelper } from "../../src/mobilehelper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { ActivityIndicator, Button, Text, TextInput, Provider as PaperProvider, MD3LightTheme, Card } from "react-native-paper";
import RNRestart from "react-native-restart";
import { Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { clearAllCachedData } from "../../src/helpers/QueryClient";
import { useUserStore, useRecentChurches, useUserChurches } from "../../src/stores/useUserStore";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#f0f2f5",
    surface: "#ffffff",
    background: "#F6F6F8",
    onSurface: "#3c3c3c",
    onBackground: "#3c3c3c",
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

const ChurchSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [selectingChurch, setSelectingChurch] = useState(false);
  const recentChurches = useRecentChurches();
  const userChurches = useUserChurches();
  const { addRecentChurch, selectChurch } = useUserStore();

  // Use react-query for church search - only search when text is provided
  const { data: searchList = [], isLoading: loading } = useQuery({
    queryKey: [`/churches/search/?name=${searchText}&app=B1&include=favicon_400x400`, "MembershipApi"],
    queryFn: async () => ApiHelper.getAnonymous(`/churches/search/?name=${searchText}&app=B1&include=favicon_400x400`, "MembershipApi"),
    enabled: searchText.length > 2, // Only search when user has typed at least 3 characters
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes - search results can be cached briefly
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  useEffect(() => {
    // Utilities.trackEvent("Church Search Screen");
    UserHelper.addOpenScreenEvent("Church Search Screen");

    // Clear image cache on screen load to ensure fresh church logos
    Image.clearDiskCache();
    Image.clearMemoryCache();
  }, []);

  const churchSelection = async (churchData: ChurchInterface) => {
    try {
      setSelectingChurch(true);

      // Check if user is already a member of this church
      let existing = userChurches.find(uc => uc.church.id === churchData.id);
      if (existing) {
        churchData = existing.church;
      }

      // Add to recent churches
      addRecentChurch(churchData);

      // Check if we're switching to a different church
      const currentChurch = useUserStore.getState().currentUserChurch?.church;
      const isSwitchingChurch = currentChurch?.id !== churchData.id;

      // Only clear cached data if switching to a different church
      if (isSwitchingChurch) {
        console.log("Switching churches, clearing cached data");
        await clearAllCachedData();
      }

      // Use the store to select the church
      await selectChurch(churchData);

      UserHelper.addAnalyticsEvent("church_selected", {
        id: Date.now(),
        device: Platform.OS,
        church: churchData.name
      });

      // Navigate to dashboard immediately for better UX
      router.replace("/(drawer)/dashboard");

      // For Android: Only restart if switching churches and after a delay to allow navigation
      if (Platform.OS === "android" && isSwitchingChurch) {
        console.log("Scheduling Android app restart due to church switch");
        // Add a small delay to allow the navigation to complete first
        setTimeout(() => {
          RNRestart.Restart();
        }, 500);
      }

      setSelectingChurch(false);
    } catch (err: any) {
      console.error("❌ Church selection error:", err);
      ErrorHelper.logError("church-search", err);
      setSelectingChurch(false);
    }
  };

  // Remove GetRecentList - no longer needed with hooks

  // Remove StoreToRecent - handled by the store now

  const renderChurchItem = ({ item, index }: { item: ChurchInterface; index: number }) => {
    const churchImage = (() => {
      // Default to B1 logo
      let image = Constants.Images.logoBlue;

      // Only use church logo if we have a valid setting with value
      if (item.settings && item.settings.length > 0) {
        // Prefer logoDark over favicon
        let setting = ArrayHelper.getOne(item.settings, "keyName", "logoDark");
        if (!setting) {
          setting = ArrayHelper.getOne(item.settings, "keyName", "favicon_400x400");
        }
        if (!setting) setting = item.settings[0];
        if (setting?.value && setting.value.trim() !== '') {
          image = { uri: setting.value };
        }
      }
      return image;
    })();

    return (
      <Card style={styles.churchCard} onPress={() => !selectingChurch && churchSelection(item)}>
        <Card.Content style={styles.churchContent}>
          <View style={styles.churchImageContainer}>
            <OptimizedImage
              source={churchImage}
              style={styles.churchImage}
              placeholder={Constants.Images.logoBlue}
            />
          </View>
          <View style={styles.churchDetails}>
            <Text variant="titleMedium" style={styles.churchName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.churchSubtitle}>
              {selectingChurch ? "Connecting..." : "Tap to connect"}
            </Text>
          </View>
          {selectingChurch ? (
            <ActivityIndicator size="small" color="#0D47A1" />
          ) : (
            <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
          )}
        </Card.Content>
      </Card>
    );
  };

  const displayedChurches = searchText.length < 3 ? recentChurches.slice().reverse() : searchList;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        {selectingChurch && (
          <View style={styles.selectionOverlay}>
            <Card style={styles.selectionCard}>
              <Card.Content style={styles.selectionContent}>
                <ActivityIndicator size="large" color="#0D47A1" />
                <Text variant="titleMedium" style={styles.selectionText}>
                  Connecting to church...
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Card style={styles.heroCard}>
              <LinearGradient colors={["#0D47A1", "#2196F3"]} style={styles.heroGradient}>
                <View style={styles.heroContent}>
                  <MaterialIcons name="church" size={48} color="#FFFFFF" style={styles.heroIcon} />
                  <Text variant="headlineMedium" style={styles.heroTitle}>
                    Find Your Church
                  </Text>
                  <Text variant="bodyLarge" style={styles.heroSubtitle}>
                    Connect with your church community today
                  </Text>
                </View>
              </LinearGradient>
            </Card>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Card style={styles.searchCard}>
              <Card.Content style={styles.searchContent}>
                <TextInput
                  mode="outlined"
                  label="Church name, city, or zip"
                  placeholder="Search for your church"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                  left={<TextInput.Icon icon="magnify" />}
                  theme={{
                    colors: {
                      primary: "#0D47A1",
                      outline: "rgba(0, 0, 0, 0.12)"
                    }
                  }}
                />
                {searchText.length > 0 && (
                  <Button
                    mode="text"
                    onPress={() => setSearchText("")}
                    style={styles.clearButton}
                    labelStyle={styles.clearButtonText}
                  >
                    Clear Search
                  </Button>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D47A1" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Searching churches...
              </Text>
            </View>
          )}

          {/* Results Section */}
          <View style={styles.resultsSection}>
            {!loading && (
              <>
                <View style={styles.sectionHeader}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    {searchText.length < 3 ? "Recent Churches" : "Search Results"}
                  </Text>
                  {searchText.length < 3 && recentChurches.length === 0 && (
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No recent churches. Search to find your church.
                    </Text>
                  )}
                  {searchText.length >= 3 && displayedChurches.length === 0 && !loading && (
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No churches found. Try a different search term.
                    </Text>
                  )}
                </View>

                {displayedChurches.length > 0 && (
                  <FlatList
                    data={displayedChurches}
                    renderItem={renderChurchItem}
                    keyExtractor={(item) => item.id || item.name || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                  />
                )}
              </>
            )}
          </View>

          {/* Helper Section */}
          {searchText.length < 3 && recentChurches.length === 0 && (
            <View style={styles.helperSection}>
              <View style={styles.helperContent}>
                <MaterialIcons name="info-outline" size={32} color="#9E9E9E" style={styles.helperIcon} />
                <Text variant="titleMedium" style={styles.helperTitle}>
                  Getting Started
                </Text>
                <Text variant="bodyMedium" style={styles.helperText}>
                  Search for your church by name, city, or zip code to get connected.
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  content: {
    flex: 1
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 24,
    minHeight: 140
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  heroIcon: {
    marginBottom: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center"
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center"
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  searchCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  searchContent: {
    padding: 20
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8
  },
  clearButton: {
    alignSelf: "flex-end"
  },
  clearButtonText: {
    color: "#0D47A1",
    fontWeight: "500"
  },

  // Loading
  loadingContainer: {
    padding: 32,
    alignItems: "center"
  },
  loadingText: {
    color: "#9E9E9E",
    marginTop: 16,
    textAlign: "center"
  },

  // Results Section
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 8
  },
  emptyText: {
    color: "#9E9E9E",
    textAlign: "center",
    fontStyle: "italic"
  },
  listContent: {
    paddingBottom: 32
  },
  separator: {
    height: 12
  },

  // Church Item
  churchCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  churchContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  churchImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#F6F6F8"
  },
  churchImage: {
    width: "100%",
    height: "100%"
  },
  churchDetails: {
    flex: 1
  },
  churchName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 4
  },
  churchSubtitle: {
    color: "#9E9E9E"
  },

  // Helper Section
  helperSection: {
    padding: 32
  },
  helperContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  helperIcon: {
    marginBottom: 16
  },
  helperTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  helperText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },

  // Selection Overlay
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  selectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  selectionContent: {
    alignItems: "center",
    padding: 32
  },
  selectionText: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center"
  }
});

export default ChurchSearch;
