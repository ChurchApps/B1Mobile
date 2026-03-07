import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import Markdown from "@ronradtke/react-native-markdown-display";
import { PlanHelper } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { ExternalVenueRefInterface } from "../../../src/helpers";
import { EnvironmentHelper } from "../../../src/helpers/EnvironmentHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useProviderContent, type ProviderContentChild } from "./hooks/useProviderContent";
import { ContentRenderer } from "./ContentRenderer";
import { useThemeColors } from "../../theme";

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
  const colors = useThemeColors();
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
              <Text style={[styles.noContentText, { color: colors.text }]}>No preview available for this item.</Text>
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
                style={[styles.childRow, index > 0 && [styles.childRowBorder, { borderTopColor: colors.divider }]]}
                onPress={() => setSelectedChild(child)}
              >
                {child.thumbnailUrl && (
                  <Image source={{ uri: child.thumbnailUrl }} style={styles.childThumbnail} resizeMode="cover" />
                )}
                <View style={styles.childContent}>
                  <Text style={[styles.childLabel, { color: colors.primary }]}>{child.label}</Text>
                  {child.description ? <Text style={[styles.childDescription, { color: colors.text }]} numberOfLines={2}>{child.description}</Text> : null}
                </View>
                {(child.seconds ?? 0) > 0 && (
                  <Text style={[styles.childTime, { color: colors.textMuted }]}>{PlanHelper.formatTime(child.seconds ?? 0)}</Text>
                )}
                <Icons name="chevron-right" size={20} color={colors.textHint} />
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
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            {selectedChild && (
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedChild(null)}>
                <Icons name="arrow-back" size={24} color={colors.iconColor} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {selectedChild ? selectedChild.label : (props.sectionName || "Lesson Section")}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
              <Icons name="close" size={28} color={colors.iconColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.contentArea}>
            {renderContent()}
          </View>
          <TouchableOpacity style={[styles.closeButtonBottom, { backgroundColor: colors.inputBg, borderTopColor: colors.divider }]} onPress={selectedChild ? () => setSelectedChild(null) : props.onClose}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>{selectedChild ? "Back" : "Close"}</Text>
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
    justifyContent: "center",
    alignItems: "center"
  },
  dialog: {
    width: "95%",
    height: screenHeight * 0.85,
    borderRadius: 16,
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
    borderBottomWidth: 1
  },
  backButton: { marginRight: 8, padding: 4 },
  title: {
    fontSize: DimensionHelper.wp(4.5),
    fontWeight: "600",
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
    borderTopWidth: 1
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
    fontWeight: "500"
  },
  childDescription: {
    fontSize: DimensionHelper.wp(3.2),
    opacity: 0.7,
    marginTop: 2
  },
  childTime: {
    fontSize: DimensionHelper.wp(3.2),
    marginHorizontal: DimensionHelper.wp(2)
  },
  closeButtonBottom: {
    paddingVertical: DimensionHelper.hp(1.5),
    alignItems: "center",
    borderTopWidth: 1
  },
  closeButtonText: {
    fontSize: DimensionHelper.wp(4),
    fontWeight: "500"
  }
});
