import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

import { MainHeader } from "../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { OptimizedImage } from "../../../src/components/OptimizedImage";
import { SermonCard } from "../../../src/components/SermonCard";
import { UserHelper, DateHelper } from "../../../src/helpers";
import { SermonInterface, PlaylistInterface } from "../../../src/mobilehelper";
import { useCurrentChurch } from "../../../src/stores/useUserStore";
import { useScreenHeader } from "@/hooks/useNavigationHeader";

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

const PlaylistDetails = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const currentChurch = useCurrentChurch();

  useScreenHeader({ title: title, placeholder: "Playlist" });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("PlaylistDetailsScreen");
  }, []);

  // Fetch playlist details
  const {
    data: playlist,
    isLoading: playlistLoading,
    error: playlistError
  } = useQuery({
    queryKey: ["/playlists/" + id, "ContentApi"],
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data: any) => {
      // Validate playlist data
      if (!data || !data.id || !data.title) {
        return null;
      }
      return data as PlaylistInterface;
    }
  });

  // Fetch sermons in this playlist
  const {
    data: sermons,
    isLoading: sermonsLoading,
    error: sermonsError
  } = useQuery({
    queryKey: ["/sermons/public/" + currentChurch?.id, "ContentApi"],
    enabled: !!currentChurch?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: (data: any[]) =>
      // Validate, filter, and sort sermon data
      data.filter((sermon: any) => sermon && sermon.id && sermon.title && sermon.playlistId === id).sort((a: any, b: any) => new Date(b.publishDate || "0").getTime() - new Date(a.publishDate || "0").getTime()) as SermonInterface[]
  });

  const isLoading = playlistLoading || sermonsLoading;

  const handleSermonPress = (sermon: SermonInterface) => {
    if (!sermon.id || !sermon.title) {
      console.warn("Invalid sermon object:", sermon);
      return;
    }
    router.push("/sermonDetails/" + sermon.id + "?title=" + encodeURIComponent(sermon.title) + "&playlistTitle=" + encodeURIComponent(title || ""));
  };

  const renderPlaylistHeader = () => {
    if (!playlist) return null;
    const hasImage = playlist.thumbnail && playlist.thumbnail.trim() !== "";

    return (
      <Card style={styles.headerCard}>
        <View style={styles.headerContainer}>
          {hasImage ? (
            <OptimizedImage source={{ uri: playlist.thumbnail }} style={styles.headerImage} contentFit="cover" />
          ) : (
            <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerImage, styles.headerFallback]}>
              <View style={styles.headerPattern}>
                <View style={styles.headerCircle1} />
                <View style={styles.headerCircle2} />
                <View style={styles.headerCircle3} />
              </View>
              <View style={styles.headerIcon}>
                <MaterialIcons name="playlist-play" size={48} color="#FFFFFF" opacity={0.9} />
              </View>
            </LinearGradient>
          )}
          <View style={styles.headerOverlay}>
            <View style={styles.headerInfo}>
              <Text variant="labelMedium" style={styles.headerLabel}>
                Sermon Series
              </Text>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                {playlist.title || "Untitled Series"}
              </Text>
              {playlist.description && (
                <Text variant="bodyMedium" style={styles.headerDescription}>
                  {playlist.description}
                </Text>
              )}
              <View style={styles.headerMeta}>
                <Text variant="bodySmall" style={styles.headerDate}>
                  {playlist.publishDate ? DateHelper.prettyDate(new Date(playlist.publishDate)) : ""}
                </Text>
                {sermons && sermons.length > 0 && (
                  <Text variant="bodySmall" style={styles.headerCount}>
                    • {sermons.length} sermon{sermons.length !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderSermonItem = (sermon: SermonInterface) => <SermonCard key={sermon.id} sermon={sermon} onPress={handleSermonPress} />;

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <MaterialIcons name="video-library" size={48} color="#9E9E9E" style={styles.emptyIcon} />
        <Text variant="titleMedium" style={styles.emptyTitle}>
          No Sermons in This Series
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Sermons will appear here as they are added to this series.
        </Text>
      </Card.Content>
    </Card>
  );

  if (playlistError || sermonsError) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <MainHeader title={title || "Playlist"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#B0120C" />
            <Text variant="titleMedium" style={styles.errorTitle}>
              Unable to Load Playlist
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Please check your connection and try again.
            </Text>
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
            <MainHeader title={title || "Playlist"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderPlaylistHeader()}

              <View style={styles.sermonsSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Sermons
                  </Text>
                  {sermons && sermons.length > 0 && (
                    <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                      {sermons.length} sermon{sermons.length !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>

                {!sermons || sermons.length === 0 ? renderEmptyState() : sermons.map(sermon => renderSermonItem(sermon))}
              </View>
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
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },

  // Header Card Styles
  headerCard: {
    marginBottom: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden"
  },
  headerContainer: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%"
  },
  headerFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  headerPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2
  },
  headerCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -30,
    right: -30
  },
  headerCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -25,
    left: -25
  },
  headerCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: "40%",
    left: "30%"
  },
  headerIcon: {
    zIndex: 2
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  headerInfo: {
    alignItems: "center"
  },
  headerLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.9
  },
  headerTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12
  },
  headerDescription: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.9
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerDate: {
    color: "#FFFFFF",
    opacity: 0.8
  },
  headerCount: {
    color: "#FFFFFF",
    opacity: 0.8
  },

  // Sermons Section
  sermonsSection: {
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
  sectionSubtitle: {
    color: "#9E9E9E"
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
  }
});

export default PlaylistDetails;
