import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import Markdown from "@ronradtke/react-native-markdown-display";
import { PlanHelper } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants, ExternalVenueRefInterface } from "../../../src/helpers";
import { EnvironmentHelper } from "../../../src/helpers/EnvironmentHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useProviderContent, type ProviderContentChild } from "./hooks/useProviderContent";
import { ContentRenderer } from "./ContentRenderer";

function detectMediaType(url: string): "video" | "image" | "iframe" {
  const lowerUrl = url.toLowerCase();
  const videoExtensions = [".mp4", ".webm", ".ogg", ".m3u8", ".mov", ".avi"];
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) return "video";
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) return "image";
  if (lowerUrl.includes("/embed/")) return "iframe";
  return "image";
}

interface Props {
  sectionId: string;
  sectionName?: string;
  externalRef?: ExternalVenueRefInterface | null;
  onClose: () => void;
  providerId?: string;
  downloadUrl?: string;
  providerPath?: string;
  providerContentPath?: string;
}

export const LessonDialog = (props: Props) => {
  const [selectedChild, setSelectedChild] = useState<ProviderContentChild | null>(null);

  const hasProviderData = !!(props.providerId && props.providerPath && props.providerContentPath) || !!props.downloadUrl;

  const { content, loading, error } = useProviderContent({
    providerId: hasProviderData ? props.providerId : undefined,
    providerPath: hasProviderData ? props.providerPath : undefined,
    providerContentPath: hasProviderData ? props.providerContentPath : undefined,
    fallbackUrl: props.downloadUrl
  });

  const hasChildren = content?.children && content.children.length > 0;

  const renderContent = () => {
    if (hasProviderData) {
      if (loading) return <ContentRenderer loading={true} />;
      if (error) return <ContentRenderer error={error} />;

      if (selectedChild) {
        const childUrl = selectedChild.downloadUrl;
        if (childUrl) {
          return (
            <ContentRenderer
              url={childUrl}
              mediaType={detectMediaType(childUrl)}
              title={selectedChild.label}
              description={selectedChild.description}
            />
          );
        }
        return (
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.paddedContent}>
            {selectedChild.description ? (
              <Markdown>{selectedChild.description}</Markdown>
            ) : (
              <Text style={styles.noContentText}>No preview available for this item.</Text>
            )}
          </ScrollView>
        );
      }

      if (content?.url) {
        return (
          <ContentRenderer
            url={content.url}
            mediaType={content.mediaType}
            title={props.sectionName}
            description={content.description}
          />
        );
      }

      if (hasChildren) {
        return (
          <ScrollView style={styles.scrollContent}>
            {content.description && (
              <View style={styles.descriptionContainer}>
                <Markdown>{content.description}</Markdown>
              </View>
            )}
            {content.children!.map((child, index) => (
              <TouchableOpacity
                key={child.id || index.toString()}
                style={[styles.childRow, index > 0 && styles.childRowBorder]}
                onPress={() => setSelectedChild(child)}
              >
                {child.thumbnailUrl && (
                  <Image source={{ uri: child.thumbnailUrl }} style={styles.childThumbnail} resizeMode="cover" />
                )}
                <View style={styles.childContent}>
                  <Text style={styles.childLabel}>{child.label}</Text>
                  {child.description ? <Text style={styles.childDescription} numberOfLines={2}>{child.description}</Text> : null}
                </View>
                {(child.seconds ?? 0) > 0 && (
                  <Text style={styles.childTime}>{PlanHelper.formatTime(child.seconds ?? 0)}</Text>
                )}
                <Icons name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      }

      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noContentText}>Preview not available for this section.</Text>
        </View>
      );
    }

    // Legacy WebView fallback
    const iframeUrl = props.externalRef
      ? `${EnvironmentHelper.LessonsRoot}/embed/external/${props.externalRef.externalProviderId}/section/${props.sectionId}`
      : `${EnvironmentHelper.LessonsRoot}/embed/section/${props.sectionId}`;

    return (
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: iframeUrl }}
          style={styles.webView}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    );
  };

  return (
    <Modal visible={!!props.sectionId} animationType="slide" transparent={true} onRequestClose={props.onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            {selectedChild && (
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedChild(null)}>
                <Icons name="arrow-back" size={24} color={Constants.Colors.Dark_Gray} />
              </TouchableOpacity>
            )}
            <Text style={styles.title} numberOfLines={1}>
              {selectedChild ? selectedChild.label : (props.sectionName || "Lesson Section")}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
              <Icons name="close" size={28} color={Constants.Colors.Dark_Gray} />
            </TouchableOpacity>
          </View>
          <View style={styles.contentArea}>
            {renderContent()}
          </View>
          <TouchableOpacity style={styles.closeButtonBottom} onPress={selectedChild ? () => setSelectedChild(null) : props.onClose}>
            <Text style={styles.closeButtonText}>{selectedChild ? "Back" : "Close"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  dialog: {
    width: "95%",
    height: screenHeight * 0.85,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DimensionHelper.wp(4),
    paddingVertical: DimensionHelper.hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  backButton: { marginRight: 8, padding: 4 },
  title: {
    fontSize: DimensionHelper.wp(4.5),
    fontWeight: "600",
    color: Constants.Colors.Dark_Gray,
    flex: 1,
    marginRight: 10
  },
  closeButton: { padding: 4 },
  contentArea: { flex: 1 },
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
  scrollContent: { flex: 1 },
  paddedContent: { padding: DimensionHelper.wp(4) },
  descriptionContainer: { padding: DimensionHelper.wp(4), paddingBottom: 0 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DimensionHelper.wp(8)
  },
  noContentText: {
    color: Constants.Colors.Dark_Gray,
    fontSize: DimensionHelper.wp(3.5),
    textAlign: "center",
    opacity: 0.7
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DimensionHelper.hp(1.5),
    paddingHorizontal: DimensionHelper.wp(4)
  },
  childRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  childThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: DimensionHelper.wp(3)
  },
  childContent: { flex: 1 },
  childLabel: {
    fontSize: DimensionHelper.wp(3.8),
    color: Constants.Colors.app_color,
    fontWeight: "500"
  },
  childDescription: {
    fontSize: DimensionHelper.wp(3.2),
    color: Constants.Colors.Dark_Gray,
    opacity: 0.7,
    marginTop: 2
  },
  childTime: {
    fontSize: DimensionHelper.wp(3.2),
    color: "#666",
    marginHorizontal: DimensionHelper.wp(2)
  },
  closeButtonBottom: {
    backgroundColor: "#f5f5f5",
    paddingVertical: DimensionHelper.hp(1.5),
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  closeButtonText: {
    fontSize: DimensionHelper.wp(4),
    color: Constants.Colors.app_color,
    fontWeight: "500"
  }
});
