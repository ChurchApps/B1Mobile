import React from "react";
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import Markdown from "@ronradtke/react-native-markdown-display";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants } from "../../../src/helpers/Constants";

interface ContentRendererProps {
  url?: string;
  mediaType?: "video" | "image" | "text" | "iframe";
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
}

function isVideoUrl(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".m3u8", ".mov", ".avi"];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

function isIframeUrl(url: string): boolean {
  return url.includes("/embed/");
}

function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  url,
  mediaType,
  title,
  description,
  loading,
  error
}) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Constants.Colors.app_color} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>
          Unable to load preview. The content may require authentication or is temporarily unavailable.
        </Text>
      </View>
    );
  }

  if (!url) {
    if (description || mediaType === "text") {
      return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.paddedContent}>
          {description ? (
            <Markdown>{description}</Markdown>
          ) : (
            <Text style={styles.noContentText}>No content to display.</Text>
          )}
        </ScrollView>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noContentText}>Preview not available for this content.</Text>
      </View>
    );
  }

  let effectiveMediaType = mediaType;
  if (!effectiveMediaType) {
    if (isVideoUrl(url)) effectiveMediaType = "video";
    else if (isIframeUrl(url)) effectiveMediaType = "iframe";
    else if (isImageUrl(url)) effectiveMediaType = "image";
    else effectiveMediaType = "image";
  }

  switch (effectiveMediaType) {
    case "video":
      return (
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: url }}
            style={styles.webView}
            startInLoadingState={true}
            javaScriptEnabled={true}
            allowsInlineMediaPlayback={true}
          />
        </View>
      );

    case "iframe":
      return (
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: url }}
            style={styles.webView}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      );

    case "text":
      return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.paddedContent}>
          {description ? (
            <Markdown>{description}</Markdown>
          ) : (
            <Text style={styles.noContentText}>No text content to display.</Text>
          )}
        </ScrollView>
      );

    case "image":
    default:
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      );
  }
};

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: DimensionHelper.wp(8),
    minHeight: 200
  },
  scrollContainer: {
    flex: 1
  },
  paddedContent: {
    padding: DimensionHelper.wp(4)
  },
  errorText: {
    color: "red",
    fontSize: DimensionHelper.wp(4),
    marginBottom: DimensionHelper.hp(1),
    textAlign: "center"
  },
  errorSubText: {
    color: Constants.Colors.Dark_Gray,
    fontSize: DimensionHelper.wp(3.5),
    textAlign: "center",
    opacity: 0.7
  },
  noContentText: {
    color: Constants.Colors.Dark_Gray,
    fontSize: DimensionHelper.wp(3.5),
    textAlign: "center",
    opacity: 0.7
  },
  webViewContainer: {
    flex: 1,
    minHeight: screenHeight * 0.5
  },
  webView: {
    flex: 1
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: DimensionHelper.wp(4)
  },
  image: {
    width: "100%",
    height: screenHeight * 0.5,
    maxHeight: screenHeight * 0.7
  }
});
