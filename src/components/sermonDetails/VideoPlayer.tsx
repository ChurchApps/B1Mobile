import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { WebView } from "react-native-webview";

interface VideoPlayerProps {
  videoUrl: string;
  visible: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, visible }) => {
  console.log("VideoPlayer - visible:", visible, "videoUrl:", videoUrl);
  if (!visible) return null;

  if (!videoUrl) {
    return (
      <Card style={styles.videoCard}>
        <View style={styles.videoContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D47A1" />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.videoCard}>
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri: videoUrl,
            headers: { Referer: "https://b1.church/" }
          }}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 B1.church"
          style={styles.webView}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D47A1" />
            </View>
          )}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
          originWhitelist={["*"]}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
          androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000"
  }
});