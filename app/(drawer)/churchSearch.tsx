import React from "react";
import { ChurchInterface, UserHelper } from "../../src/helpers";
import { ErrorHelper } from "../../src/mobilehelper";
import { ApiHelper } from "../../src/mobilehelper";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { clearAllCachedData } from "../../src/helpers/QueryClient";
import { useUserStore, useRecentChurches, useUserChurches } from "../../src/stores/useUserStore";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ChurchSearchHero, 
  ChurchSearchInput, 
  ChurchListItem, 
  SearchLoadingIndicator, 
  GettingStartedHelper, 
  ChurchSelectionOverlay 
} from "../../src/components/churchSearch/exports";

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
        church: churchData.name
      });

      // Navigate to dashboard immediately for better UX
      router.replace("/(drawer)/dashboard");

      setSelectingChurch(false);
    } catch (err: any) {
      console.error("❌ Church selection error:", err);
      ErrorHelper.logError("church-search", err);
      setSelectingChurch(false);
    }
  };

  // Remove GetRecentList - no longer needed with hooks

  // Remove StoreToRecent - handled by the store now

  const renderChurchItem = ({ item }: { item: ChurchInterface }) => (
    <ChurchListItem 
      church={item} 
      onPress={churchSelection} 
      isSelecting={selectingChurch} 
    />
  );

  const displayedChurches = searchText.length < 3 ? recentChurches.slice().reverse() : searchList;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <ChurchSelectionOverlay visible={selectingChurch} />
        <View style={styles.content}>
          <ChurchSearchHero />

          <ChurchSearchInput 
            searchText={searchText} 
            onSearchTextChange={setSearchText} 
          />

          {loading && <SearchLoadingIndicator />}

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

                {displayedChurches.length > 0 && <FlatList data={displayedChurches} renderItem={renderChurchItem} keyExtractor={item => item.id || item.name || Math.random().toString()} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} ItemSeparatorComponent={() => <View style={styles.separator} />} />}
              </>
            )}
          </View>

          {searchText.length < 3 && recentChurches.length === 0 && <GettingStartedHelper />}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  content: {
    flex: 1
  },
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
  }
});

export default ChurchSearch;
