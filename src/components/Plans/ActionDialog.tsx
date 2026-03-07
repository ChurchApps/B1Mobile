import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { ExternalVenueRefInterface } from "../../../src/helpers";
import { EnvironmentHelper } from "../../../src/helpers/EnvironmentHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useProviderContent } from "./hooks/useProviderContent";
import { ContentRenderer } from "./ContentRenderer";
import { useThemeColors } from "../../theme";

interface Props {
  actionId: string;
  contentName?: string;
  onClose: () => void;
  externalRef?: ExternalVenueRefInterface | null;
  providerId?: string;
  downloadUrl?: string;
  providerPath?: string;
  providerContentPath?: string;
}

export const ActionDialog = (props: Props) => {
  const colors = useThemeColors();
  const hasProviderData = !!(props.providerId && props.providerPath && props.providerContentPath) || !!props.downloadUrl;

  const { content, loading, error } = useProviderContent({
    providerId: hasProviderData ? props.providerId : undefined,
    providerPath: hasProviderData ? props.providerPath : undefined,
    providerContentPath: hasProviderData ? props.providerContentPath : undefined,
    fallbackUrl: props.downloadUrl
  });

  const renderContent = () => {
    if (hasProviderData) {
      return (
        <ContentRenderer
          url={content?.url}
          mediaType={content?.mediaType}
          title={props.contentName}
          description={content?.description}
          loading={loading}
          error={error || undefined}
        />
      );
    }

    // Legacy WebView fallback
    const iframeUrl = props.externalRef
      ? `${EnvironmentHelper.LessonsRoot}/embed/external/${props.externalRef.externalProviderId}/action/${props.actionId}`
      : `${EnvironmentHelper.LessonsRoot}/embed/action/${props.actionId}`;

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
    <Modal visible={!!props.actionId} animationType="slide" transparent={true} onRequestClose={props.onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{props.contentName || "Action"}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
              <Icons name="close" size={28} color={colors.iconColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.contentArea}>
            {renderContent()}
          </View>
          <TouchableOpacity style={[styles.closeButtonBottom, { backgroundColor: colors.inputBg, borderTopColor: colors.divider }]} onPress={props.onClose}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
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
