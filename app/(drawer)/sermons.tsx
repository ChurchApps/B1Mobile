import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "../../src/hooks";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { SermonCard } from "../../src/components/SermonCard";
import { FeaturedSermon, PlaylistCard, LiveStreamCard, EmptyState, SermonsTabBar, type LiveStreamData } from "../../src/components/sermons/exports";
import { UserHelper } from "../../src/helpers";
import { PlaylistInterface, SermonInterface } from "../../src/mobilehelper";
import { useCurrentChurch } from "../../src/stores/useUserStore";

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

const Sermons = () => {
  const { t } = useTranslation();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack, router } = useNavigation();
  const [activeSection, setActiveSection] = useState<"playlists" | "recent">("playlists");
  const currentChurch = useCurrentChurch();

  useEffect(() => {
    UserHelper.addOpenScreenEvent("SermonsScreen");
  }, []);

  // Fetch playlists
  const {
    data: playlists,
    isLoading: playlistsLoading,
    error: playlistsError
  } = useQuery({
    queryKey: ["/playlists/public/" + currentChurch?.id, "ContentApi"],
    enabled: !!currentChurch?.id,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data: any[]) =>
      // Validate and filter playlist data
      data.filter((playlist: any) => playlist && playlist.id && playlist.title) as PlaylistInterface[]
  });

  // Fetch recent sermons
  const {
    data: recentSermons,
    isLoading: sermonsLoading,
    error: sermonsError
  } = useQuery({
    queryKey: ["/sermons/public/" + currentChurch?.id, "ContentApi"],
    enabled: !!currentChurch?.id,
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: (data: any[]) =>
      // Validate and filter sermon data
      data.filter((sermon: any) => sermon && sermon.id && sermon.title) as SermonInterface[]
  });

  const isLoading = playlistsLoading || sermonsLoading;

  // Get most recent sermon for hero display
  const featuredSermon = useMemo(() => {
    if (!recentSermons || recentSermons.length === 0) return null;
    return recentSermons.sort((a: SermonInterface, b: SermonInterface) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime())[0];
  }, [recentSermons]);

  // Sort playlists by most recent
  const sortedPlaylists = useMemo(() => {
    if (!playlists) return [];
    return [...playlists].sort((a: PlaylistInterface, b: PlaylistInterface) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
  }, [playlists]);

  // Sort sermons by most recent
  const sortedSermons = useMemo(() => {
    if (!recentSermons) return [];
    return [...recentSermons].sort((a: SermonInterface, b: SermonInterface) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
  }, [recentSermons]);

  // Live stream data (in a real app, this would come from an API)
  const liveStreamData = useMemo<LiveStreamData>(() => {
    // Sample live stream schedule
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
    nextSunday.setHours(10, 0, 0, 0); // 10:00 AM

    // If it's already past Sunday 10 AM, move to next week
    if (nextSunday <= now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    return {
      isLive: false, // Set to true when actually live
      nextStreamDate: nextSunday,
      streamTitle: "Sunday Morning Service",
      streamDescription: "Join us for worship, prayer, and God's Word",
      streamUrl: "https://example.com/live-stream" // In real app, this would be the actual stream URL
    };
  }, []);

  // Calculate time until next stream
  const timeUntilStream = useMemo(() => {
    const now = new Date();
    const streamDate = liveStreamData.nextStreamDate;
    const diffMs = streamDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  }, [liveStreamData.nextStreamDate]);

  // Show countdown if within 24 hours or currently live
  const showCountdown = useMemo(() => {
    if (liveStreamData.isLive) return true;
    const diffMs = liveStreamData.nextStreamDate.getTime() - new Date().getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours <= 24 && hours > 0;
  }, [liveStreamData.isLive, liveStreamData.nextStreamDate]);

  const handlePlaylistPress = (playlist: PlaylistInterface) => {
    if (!playlist.id || !playlist.title) {
      console.warn("Invalid playlist object:", playlist);
      return;
    }
    router.push("/playlistDetails/" + playlist.id + "?title=" + encodeURIComponent(playlist.title));
  };

  const handleSermonPress = (sermon: SermonInterface) => {
    if (!sermon.id || !sermon.title) {
      console.warn("Invalid sermon object:", sermon);
      return;
    }
    router.push("/sermonDetails/" + sermon.id + "?title=" + encodeURIComponent(sermon.title));
  };

  const renderFeaturedSermon = () => {
    if (!featuredSermon) return null;
    return <FeaturedSermon sermon={featuredSermon} onPress={handleSermonPress} />;
  };

  const renderPlaylistCard = (playlist: PlaylistInterface) => <PlaylistCard key={playlist.id} playlist={playlist} onPress={handlePlaylistPress} />;

  const renderSermonCard = (sermon: SermonInterface) => <SermonCard key={sermon.id} sermon={sermon} onPress={handleSermonPress} />;

  const renderCountdown = () => <LiveStreamCard liveStreamData={liveStreamData} timeUntilStream={timeUntilStream} />;

  const renderPlaylistsSection = () => (
    <View style={styles.section}>
      {/* Show countdown/live stream in hero zone if within 24 hours, otherwise show featured sermon */}
      {showCountdown ? renderCountdown() : renderFeaturedSermon()}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          {t("sermons.sermonSeries")}
        </Text>
      </View>

      {sortedPlaylists.length === 0 ? <EmptyState type="playlists" /> : sortedPlaylists.map(renderPlaylistCard)}
    </View>
  );

  const renderRecentSection = () => (
    <View style={styles.section}>
      {/* Show countdown/live stream at the top if within 24 hours */}
      {showCountdown && renderCountdown()}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          {t("sermons.recentSermons")}
        </Text>
      </View>

      {sortedSermons.length === 0 ? <EmptyState type="sermons" /> : sortedSermons.map(renderSermonCard)}
    </View>
  );

  if (playlistsError || sermonsError) {
    console.error("Sermons error - playlists:", playlistsError, "sermons:", sermonsError);
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <MainHeader title={t("sermons.sermons")} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#B0120C" />
            <Text variant="titleMedium" style={styles.errorTitle}>
              {t("sermons.unableToLoad")}
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              {t("sermons.checkConnection")}
            </Text>
            {__DEV__ && (
              <Text variant="bodySmall" style={[styles.errorMessage, { marginTop: 8 }]}>
                Church ID: {currentChurch?.id || "Not set"}
              </Text>
            )}
            <Button mode="contained" onPress={() => navigateBack()} style={styles.errorButton}>
              {t("sermons.goBack")}
            </Button>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.content}>
            <MainHeader title={t("sermons.sermons")} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />

            <SermonsTabBar activeSection={activeSection} onTabChange={setActiveSection} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {activeSection === "playlists" && renderPlaylistsSection()}
              {activeSection === "recent" && renderRecentSection()}
            </ScrollView>
          </View>
        </LoadingWrapper>
      </View>
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
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },
  section: {
    flex: 1
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    fontSize: 20
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  errorTitle: {
    color: "#B0120C",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 24
  },
  errorButton: {
    backgroundColor: "#0D47A1"
  }
});

export default Sermons;
