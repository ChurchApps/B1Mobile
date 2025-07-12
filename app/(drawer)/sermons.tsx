import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "../../src/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { SermonCard } from "../../src/components/SermonCard";
import { UserHelper, DateHelper } from "../../src/helpers";
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
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack, router } = useNavigation();
  const [activeSection, setActiveSection] = useState<"playlists" | "recent">("playlists");
  const currentChurch = useCurrentChurch();

  useEffect(() => {
    UserHelper.addOpenScreenEvent("SermonsScreen");
    console.log("Sermons screen loaded, church ID:", currentChurch?.id);
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
  const liveStreamData = useMemo(() => {
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
    console.log("Navigating to playlist:", playlist.id, playlist.title);
    router.push("/(drawer)/playlistDetails/" + playlist.id + "?title=" + encodeURIComponent(playlist.title));
  };

  const handleSermonPress = (sermon: SermonInterface) => {
    if (!sermon.id || !sermon.title) {
      console.warn("Invalid sermon object:", sermon);
      return;
    }
    router.push("/(drawer)/sermonDetails/" + sermon.id + "?title=" + encodeURIComponent(sermon.title));
  };

  const renderFeaturedSermon = () => {
    if (!featuredSermon) return null;

    const hasImage = featuredSermon.thumbnail && featuredSermon.thumbnail.trim() !== "";

    return (
      <TouchableOpacity onPress={() => handleSermonPress(featuredSermon)}>
        <Card style={styles.heroCard}>
          <View style={styles.heroContainer}>
            {hasImage ? (
              <OptimizedImage source={{ uri: featuredSermon.thumbnail }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.heroImage, styles.heroFallback]}>
                <View style={styles.heroPattern}>
                  <View style={styles.heroCircle1} />
                  <View style={styles.heroCircle2} />
                  <View style={styles.heroCircle3} />
                </View>
                <View style={styles.heroIcon}>
                  <MaterialIcons name="video-library" size={48} color="#FFFFFF" opacity={0.9} />
                </View>
              </LinearGradient>
            )}
            <View style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <Text variant="labelMedium" style={styles.heroLabel}>
                  Latest Sermon
                </Text>
                <Text variant="headlineSmall" style={styles.heroTitle} numberOfLines={2}>
                  {featuredSermon.title || "Untitled Sermon"}
                </Text>
                <Text variant="bodyMedium" style={styles.heroDate}>
                  {featuredSermon.publishDate ? DateHelper.prettyDate(new Date(featuredSermon.publishDate)) : ""}
                </Text>
                {featuredSermon.duration && (
                  <Text variant="bodySmall" style={styles.heroDuration}>
                    {Math.floor(featuredSermon.duration / 60)}:{(featuredSermon.duration % 60).toString().padStart(2, "0")}
                  </Text>
                )}
              </View>
              <View style={styles.playButton}>
                <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderPlaylistCard = (playlist: PlaylistInterface) => {
    const hasImage = playlist.thumbnail && playlist.thumbnail.trim() !== "";
    return (
      <TouchableOpacity key={playlist.id} onPress={() => handlePlaylistPress(playlist)}>
        <Card style={styles.playlistCard}>
          <View style={styles.playlistContent}>
            <View style={styles.playlistImageContainer}>
              {hasImage ? (
                <OptimizedImage source={{ uri: playlist.thumbnail }} style={styles.playlistImage} contentFit="cover" />
              ) : (
                <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.playlistImage, styles.playlistFallback]}>
                  <View style={styles.playlistPattern}>
                    <View style={styles.playlistCircle1} />
                    <View style={styles.playlistCircle2} />
                  </View>
                  <View style={styles.playlistIcon}>
                    <MaterialIcons name="playlist-play" size={32} color="#FFFFFF" opacity={0.9} />
                  </View>
                </LinearGradient>
              )}
            </View>
            <View style={styles.playlistOverlay}>
              <View style={styles.playlistInfo}>
                <Text variant="titleMedium" style={styles.playlistTitle} numberOfLines={2}>
                  {playlist.title}
                </Text>
                {playlist.description && (
                  <Text variant="bodySmall" style={styles.playlistDescription} numberOfLines={2}>
                    {playlist.description}
                  </Text>
                )}
                <Text variant="bodySmall" style={styles.playlistDate}>
                  {playlist.publishDate ? DateHelper.prettyDate(new Date(playlist.publishDate)) : ""}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderSermonCard = (sermon: SermonInterface) => <SermonCard key={sermon.id} sermon={sermon} onPress={handleSermonPress} />;

  const renderCountdown = () => {
    if (liveStreamData.isLive) {
      return (
        <Card style={styles.liveCard}>
          <LinearGradient colors={["#D32F2F", "#F44336"]} style={styles.liveGradient}>
            <View style={styles.liveContent}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text variant="titleMedium" style={styles.liveText}>
                  LIVE NOW
                </Text>
              </View>
              <Text variant="headlineSmall" style={styles.liveTitle}>
                {liveStreamData.streamTitle}
              </Text>
              <Text variant="bodyMedium" style={styles.liveDescription}>
                {liveStreamData.streamDescription}
              </Text>
              <Button
                mode="contained"
                style={styles.watchButton}
                labelStyle={styles.watchButtonText}
                icon="play-circle"
                onPress={() => {
                  // In a real app, this would open the live stream
                  console.log("Opening live stream:", liveStreamData.streamUrl);
                }}>
                Watch Live
              </Button>
            </View>
          </LinearGradient>
        </Card>
      );
    }

    return (
      <Card style={styles.countdownCard}>
        <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.countdownGradient}>
          <View style={styles.countdownContent}>
            <Text variant="titleMedium" style={styles.countdownLabel}>
              Next Service In
            </Text>
            <View style={styles.countdownTimer}>
              {timeUntilStream.days > 0 && (
                <View style={styles.timeUnit}>
                  <Text variant="displaySmall" style={styles.timeNumber}>
                    {timeUntilStream.days}
                  </Text>
                  <Text variant="bodyMedium" style={styles.timeLabel}>
                    {timeUntilStream.days === 1 ? "Day" : "Days"}
                  </Text>
                </View>
              )}
              <View style={styles.timeUnit}>
                <Text variant="displaySmall" style={styles.timeNumber}>
                  {timeUntilStream.hours}
                </Text>
                <Text variant="bodyMedium" style={styles.timeLabel}>
                  {timeUntilStream.hours === 1 ? "Hour" : "Hours"}
                </Text>
              </View>
              <View style={styles.timeUnit}>
                <Text variant="displaySmall" style={styles.timeNumber}>
                  {timeUntilStream.minutes}
                </Text>
                <Text variant="bodyMedium" style={styles.timeLabel}>
                  {timeUntilStream.minutes === 1 ? "Minute" : "Minutes"}
                </Text>
              </View>
            </View>
            <Text variant="titleMedium" style={styles.streamTitle}>
              {liveStreamData.streamTitle}
            </Text>
            <Text variant="bodyMedium" style={styles.streamDescription}>
              {liveStreamData.streamDescription}
            </Text>
            <Text variant="bodySmall" style={styles.streamTime}>
              {liveStreamData.nextStreamDate.toLocaleDateString()} at {liveStreamData.nextStreamDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderPlaylistsSection = () => (
    <View style={styles.section}>
      {/* Show countdown/live stream in hero zone if within 24 hours, otherwise show featured sermon */}
      {showCountdown ? renderCountdown() : renderFeaturedSermon()}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Sermon Series
        </Text>
      </View>

      {sortedPlaylists.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialIcons name="playlist-add" size={48} color="#9E9E9E" style={styles.emptyIcon} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Sermon Series Available
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Check back later for new sermon series from your church.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        sortedPlaylists.map(renderPlaylistCard)
      )}
    </View>
  );

  const renderRecentSection = () => (
    <View style={styles.section}>
      {/* Show countdown/live stream at the top if within 24 hours */}
      {showCountdown && renderCountdown()}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Sermons
        </Text>
      </View>

      {sortedSermons.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialIcons name="video-library" size={48} color="#9E9E9E" style={styles.emptyIcon} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Recent Sermons
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Check back later for new sermons from your church.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        sortedSermons.map(renderSermonCard)
      )}
    </View>
  );

  if (playlistsError || sermonsError) {
    console.error("Sermons error - playlists:", playlistsError, "sermons:", sermonsError);
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <MainHeader title="Sermons" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#B0120C" />
            <Text variant="titleMedium" style={styles.errorTitle}>
              Unable to Load Sermons
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Please check your connection and try again.
            </Text>
            {__DEV__ && (
              <Text variant="bodySmall" style={[styles.errorMessage, { marginTop: 8 }]}>
                Church ID: {currentChurch?.id || "Not set"}
              </Text>
            )}
            <Button mode="contained" onPress={() => navigateBack()} style={styles.errorButton}>
              Go Back
            </Button>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.content}>
            <MainHeader title="Sermons" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, activeSection === "playlists" && styles.activeTab]} onPress={() => setActiveSection("playlists")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "playlists" && styles.activeTabText]}>
                  Series
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeSection === "recent" && styles.activeTab]} onPress={() => setActiveSection("recent")}>
                <Text variant="labelLarge" style={[styles.tabText, activeSection === "recent" && styles.activeTabText]}>
                  Recent
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {activeSection === "playlists" && renderPlaylistsSection()}
              {activeSection === "recent" && renderRecentSection()}
            </ScrollView>
          </View>
        </LoadingWrapper>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomColor: "#0D47A1"
  },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
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

  // Hero Card Styles
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroContainer: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%"
  },
  heroFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2
  },
  heroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -50
  },
  heroCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -40,
    left: -40
  },
  heroCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: "30%",
    left: "25%"
  },
  heroIcon: {
    zIndex: 2
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end"
  },
  heroContent: {
    flex: 1,
    marginRight: 16
  },
  heroLabel: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8
  },
  heroDate: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4
  },
  heroDuration: {
    color: "#FFFFFF",
    opacity: 0.8
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(21, 101, 192, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },

  // Section Styles
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

  // Playlist Card Styles
  playlistCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  playlistContent: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  playlistImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  playlistImage: {
    width: "100%",
    height: "100%"
  },
  playlistFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  playlistPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3
  },
  playlistCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -20,
    right: -20
  },
  playlistCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -15,
    left: -15
  },
  playlistIcon: {
    zIndex: 2
  },
  playlistOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12
  },
  playlistTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 16
  },
  playlistDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
    fontSize: 14
  },
  playlistDate: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 12
  },

  // Empty State
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    alignItems: "center",
    padding: 32
  },
  emptyIcon: {
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  },

  // Live Stream Styles
  liveCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  liveGradient: {
    padding: 24,
    alignItems: "center"
  },
  liveContent: {
    alignItems: "center"
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    marginRight: 8
  },
  liveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1
  },
  liveTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  liveDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 20
  },
  watchButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 24
  },
  watchButtonText: {
    color: "#D32F2F",
    fontWeight: "700"
  },

  // Countdown Styles
  countdownCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  countdownGradient: {
    padding: 24,
    alignItems: "center"
  },
  countdownContent: {
    alignItems: "center"
  },
  countdownLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 24
  },
  timeUnit: {
    alignItems: "center"
  },
  timeNumber: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 36,
    marginBottom: 4
  },
  timeLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  streamTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  streamDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12
  },
  streamTime: {
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    fontSize: 14
  },

  // Error State
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
