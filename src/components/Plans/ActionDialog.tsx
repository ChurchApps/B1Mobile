import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { Constants, ExternalVenueRefInterface } from "../../../src/helpers";
import { EnvironmentHelper } from "../../../src/helpers/EnvironmentHelper";
import Icons from "@expo/vector-icons/MaterialIcons";
import { useProviderContent } from "./hooks/useProviderContent";
import { ContentRenderer } from "./ContentRenderer";

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
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{props.contentName || "Action"}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
              <Icons name="close" size={28} color={Constants.Colors.Dark_Gray} />
            </TouchableOpacity>
          </View>
          <View style={styles.contentArea}>
            {renderContent()}
          </View>
          <TouchableOpacity style={styles.closeButtonBottom} onPress={props.onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
