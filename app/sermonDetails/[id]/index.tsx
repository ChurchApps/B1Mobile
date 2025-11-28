import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Share, Alert, Linking } from "react-native";
import { Provider as PaperProvider, Text, MD3LightTheme, Button, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

import { MainHeader } from "../../../src/components/wrapper/MainHeader";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { VideoPlayer, VideoPreview, SermonInfo, SermonActions } from "../../../src/components/sermonDetails/exports";
import { UserHelper } from "../../../src/helpers";
import { SermonInterface } from "../../../src/mobilehelper";
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

const SermonDetails = () => {
  const { t } = useTranslation();
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

  useScreenHeader({ title: title, placeholder: t("sermons.sermon") });

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

    Alert.alert(t("common.openInBrowser"), t("sermons.openInBrowserPrompt"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.open"),
        onPress: () => Linking.openURL(videoUrl)
      }
    ]);
  };

  const renderVideoPlayer = () => <VideoPlayer videoUrl={videoUrl || ""} visible={showVideo} />;

  const renderVideoPreview = () => {
    if (!sermon) return null;
    return <VideoPreview sermon={sermon} onPlay={() => setShowVideo(true)} visible={!showVideo} formatDuration={formatDuration} />;
  };

  const renderSermonInfo = () => {
    if (!sermon) return null;
    return <SermonInfo sermon={sermon} playlistTitle={playlistTitle} formatDuration={formatDuration} />;
  };

  const renderActionButtons = () => <SermonActions onShare={handleShare} onExternalLink={handleExternalLink} onWatchVideo={() => setShowVideo(true)} showWatchButton={!showVideo} />;

  if (error) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <MainHeader title={title || t("sermons.sermon")} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />
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
      <View style={styles.container}>
        <LoadingWrapper loading={isLoading}>
          <View style={styles.content}>
            <MainHeader title={sermon?.title || title || t("sermons.sermon")} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderVideoPreview()}
              {renderVideoPlayer()}
              {renderSermonInfo()}
              {renderActionButtons()}
            </ScrollView>

            {/* Floating Action Button for video toggle */}
            {showVideo && <FAB icon={() => <MaterialIcons name="close" size={24} color="#FFFFFF" />} style={styles.fab} onPress={() => setShowVideo(false)} label={t("sermons.closeVideo")} />}
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
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#0D47A1"
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

export default SermonDetails;
