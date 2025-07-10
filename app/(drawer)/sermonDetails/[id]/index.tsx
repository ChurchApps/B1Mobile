import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Share, Alert, Linking } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Card, Button, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import { MainHeader } from "../../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../../src/components/wrapper/LoadingWrapper";
import { OptimizedImage } from "../../../../src/components/OptimizedImage";
import { UserHelper, DateHelper } from "../../../../src/helpers";
import { SermonInterface } from "../../../../src/mobilehelper";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1565C0",
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

const SermonDetails = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { id, title, playlistTitle } = useLocalSearchParams<{
    id: string;
    title: string;
    playlistTitle?: string;
  }>();

  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    UserHelper.addOpenScreenEvent("SermonDetailsScreen");
  }, []);

  // Fetch sermon details
  const {
    data: sermon,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/sermons/" + id, "ContentApi"],
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    select: (data: any) => {
      // Validate sermon data
      if (!data || !data.id || !data.title) {
        return null;
      }
      return data as SermonInterface;
    }
  });

  // Generate video URL based on video type and data
  const videoUrl = useMemo(() => {
    if (!sermon?.videoData || !sermon?.videoType) return null;

    switch (sermon.videoType) {
      case "youtube":
        return `https://www.youtube.com/embed/${sermon.videoData}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`;
      case "youtube_channel":
        return `https://www.youtube.com/embed/live_stream?channel=${sermon.videoData}&autoplay=1`;
      case "vimeo":
        return `https://player.vimeo.com/video/${sermon.videoData}?autoplay=1`;
      case "facebook":
        return `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fvideo.php%3Fv%3D${sermon.videoData}&show_text=0&autoplay=1&allowFullScreen=1`;
      default:
        return sermon.videoData; // Custom URL
    }
  }, [sermon]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (!sermon) return;

    try {
      const shareUrl = videoUrl || `https://church.app/sermon/${sermon.id}`;
      await Share.share({
        message: `Check out this sermon: "${sermon.title}" ${shareUrl}`,
        url: shareUrl,
        title: sermon.title
      });
    } catch (error) {
      console.error("Error sharing sermon:", error);
    }
  };

  const handleExternalLink = () => {
    if (!videoUrl) return;

    Alert.alert("Open in Browser", "Would you like to open this sermon in your web browser?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: () => Linking.openURL(videoUrl)
      }
    ]);
  };

  const renderVideoPlayer = () => {
    if (!showVideo || !videoUrl) return null;

    return (
      <Card style={styles.videoCard}>
        <View style={styles.videoContainer}>
          <WebView source={{ uri: videoUrl }} style={styles.webView} allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} javaScriptEnabled domStorageEnabled startInLoadingState scalesPageToFit />
        </View>
      </Card>
    );
  };

  const renderVideoPreview = () => {
    if (showVideo || !sermon) return null;

    return (
      <Card style={styles.previewCard}>
        <TouchableOpacity style={styles.previewContainer} onPress={() => setShowVideo(true)}>
          <OptimizedImage source={{ uri: sermon.thumbnail || "" }} style={styles.previewImage} contentFit="cover" />
          <View style={styles.previewOverlay}>
            <View style={styles.playButton}>
              <MaterialIcons name="play-arrow" size={48} color="#FFFFFF" />
            </View>
            {sermon.duration && (
              <View style={styles.durationBadge}>
                <Text variant="bodyMedium" style={styles.durationText}>
                  {formatDuration(sermon.duration)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderSermonInfo = () => {
    if (!sermon) return null;

    return (
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          {playlistTitle && (
            <Text variant="labelMedium" style={styles.seriesLabel}>
              {playlistTitle}
            </Text>
          )}

          <Text variant="headlineSmall" style={styles.sermonTitle}>
            {sermon.title || "Untitled Sermon"}
          </Text>

          <View style={styles.metaRow}>
            <Text variant="bodyMedium" style={styles.dateText}>
              {sermon.publishDate ? DateHelper.prettyDate(new Date(sermon.publishDate)) : ""}
            </Text>
            {sermon.duration && (
              <>
                <Text variant="bodyMedium" style={styles.separator}>
                  •
                </Text>
                <Text variant="bodyMedium" style={styles.durationInfo}>
                  {formatDuration(sermon.duration)}
                </Text>
              </>
            )}
          </View>

          {sermon.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {sermon.description}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <View style={styles.actionRow}>
        <Button mode="outlined" onPress={handleShare} style={styles.actionButton} icon={() => <MaterialIcons name="share" size={20} color="#1565C0" />}>
          Share
        </Button>

        <Button mode="outlined" onPress={handleExternalLink} style={styles.actionButton} icon={() => <MaterialIcons name="open-in-new" size={20} color="#1565C0" />}>
          Open Link
        </Button>
      </View>

      {!showVideo && (
        <Button mode="contained" onPress={() => setShowVideo(true)} style={styles.watchButton} icon={() => <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />}>
          Watch Sermon
        </Button>
      )}
    </View>
  );

  if (error) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <MainHeader title={title || "Sermon"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#B0120C" />
            <Text variant="titleMedium" style={styles.errorTitle}>
              Unable to Load Sermon
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Please check your connection and try again.
            </Text>
            <Button mode="contained" onPress={() => router.back()} style={styles.errorButton}>
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
            <MainHeader title={sermon?.title || title || "Sermon"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderVideoPreview()}
              {renderVideoPlayer()}
              {renderSermonInfo()}
              {renderActionButtons()}
            </ScrollView>

            {/* Floating Action Button for video toggle */}
            {showVideo && <FAB icon={() => <MaterialIcons name="close" size={24} color="#FFFFFF" />} style={styles.fab} onPress={() => setShowVideo(false)} label="Close Video" />}
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

  // Video Styles
  videoCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000"
  },
  webView: {
    flex: 1
  },

  // Preview Styles
  previewCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  previewContainer: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  previewImage: {
    width: "100%",
    height: "100%"
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(21, 101, 192, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  durationBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  durationText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },

  // Info Card Styles
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  infoContent: {
    padding: 20
  },
  seriesLabel: {
    color: "#1565C0",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  sermonTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 32
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  dateText: {
    color: "#9E9E9E"
  },
  separator: {
    color: "#9E9E9E",
    marginHorizontal: 8
  },
  durationInfo: {
    color: "#9E9E9E"
  },
  description: {
    color: "#3c3c3c",
    lineHeight: 22
  },

  // Action Styles
  actionContainer: {
    marginTop: 8
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderColor: "#1565C0"
  },
  watchButton: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },

  // FAB Styles
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#1565C0"
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
    backgroundColor: "#1565C0"
  }
});

export default SermonDetails;
