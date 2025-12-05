import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { WebView } from "react-native-webview";

interface VideoPlayerProps {
  videoUrl: string;
  visible: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, visible }) => {
  if (!visible || !videoUrl) return null;

  return (
    <Card style={styles.videoCard}>
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri: videoUrl,
            headers: { Referer: "https://b1.church/" }
          }}
          style={styles.webView}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
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
  }
});