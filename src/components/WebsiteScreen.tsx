import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, View, Text, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";
import { ApiHelper, globalStyles, prepareWebViewAuth, SecureStorageHelper, WebViewAllowlist } from "../../src/helpers";
import { MainHeader } from "./wrapper/MainHeader";
import { UserHelper } from "../helpers/UserHelper";
import { eventBus } from "@/helpers/PushNotificationHelper";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader } from "./Loader";
import { useThemeColors } from "../theme";

interface WebsiteScreenProps {
  url: string;
  title: string;
  sessionJwt?: string;
}

export function WebsiteScreen({ url, title, sessionJwt }: WebsiteScreenProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const navigationMain = useNavigation();
  const authStore = useAuthStore;
  const pageUrl = WebViewAllowlist.normalizeUrl(url);
  const webViewAuth = prepareWebViewAuth(pageUrl, sessionJwt);

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Website Screen", { url: webViewAuth.uri });
    if (!WebViewAllowlist.isAllowedUrl(pageUrl)) {
      if (router.canGoBack()) router.back();
      return;
    }
    const timer = setTimeout(() => {
      setCurrentUrl(webViewAuth.uri);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigationMain &&
        navigationMain.setOptions({ title: title || "Website" });
    }, [navigationMain, title])
  );

  const handleMessage = (event: any) => {
    const message = WebViewAllowlist.acceptedMessage(event?.nativeEvent?.url, event?.nativeEvent?.data);
    if (!message) return;
    if (message.event === "profile_updated") manageUserUpdate();
    if (message.event === "profile_deleted") eventBus.emit("do_logout");
  };

  const manageUserUpdate = async () => {
    setIsLoading(true);
    // Attempt to re-authenticate with JWT
    const data = await ApiHelper.postAnonymous("/users/login", { jwt: await SecureStorageHelper.getSecureItem("default_jwt") }, "MembershipApi");
    if (data.user != null) {
      await authStore.getState().handleLogin(data);
    }
    setIsLoading(false);
    navigation.goBack();
  };

  const urlToScreenMapping: { [key: string]: string } = {
    "/donate": "/(drawer)/donation",
    "/groups/details/": "/groupDetailsRoot",
    "/my/checkin": "/(drawer)/service",
    "/my/community": "/(drawer)/membersSearch",
    "/my/community/": "/memberDetailRoot",
    "/my/groups": "/myGroupsRoot",
    "/my/plans": "/(drawer)/plan",
    "/my/plans/": "/(drawer)/planDetails",
    "/votd": "/(drawer)/votd"
  };

  const extractIdFromUrl = (url: string, basePath: string) => {
    if (url.startsWith(basePath)) {
      return url.replace(basePath, "").split("?")[0];
    }
    return null;
  };

  const handleWebViewNavigationStateChange = (event: { url: string }) => {
    const { url } = event;
    if (!WebViewAllowlist.isAllowedUrl(url)) return false;
    const baseUrlMatch = url.match(/^(https?:\/\/[^/]+)/);
    const baseUrl = baseUrlMatch ? baseUrlMatch[1] : "";

    if (url.includes("/donate")) {
      if (Platform.OS === "android") {
        router.navigate("/(drawer)/donation");
        return false;
      } else if (Platform.OS === "ios") {
        return true;
      }
    }
    for (const basePath in urlToScreenMapping) {
      const screenPath = urlToScreenMapping[basePath];

      if (basePath.endsWith("/")) {
        const fullUrl = `${baseUrl}${basePath}`;
        const id = extractIdFromUrl(url, fullUrl);
        if (id) {
          router.navigate(screenPath as never, { params: { id } });
          return false;
        }
      } else if (url === `${baseUrl}${basePath}`) {
        router.navigate(screenPath);
        return false;
      }
    }

    return true;
  };

  const handleShouldStartLoadWithRequest = (request: { url: string; isTopFrame?: boolean }) => {
    if (!WebViewAllowlist.shouldLoadInWebView(request)) {
      if (WebViewAllowlist.isSafeExternalUrl(request.url)) Linking.openURL(request.url);
      return false;
    }
    return handleWebViewNavigationStateChange(request);
  };

  return (
    <View style={[globalStyles.homeContainer, { backgroundColor: colors.surface }]}>
      <MainHeader title={title || "Home"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />
      <View style={globalStyles.webViewContainer} onLayout={() => setIsLayoutReady(true)}>
        {isLayoutReady && currentUrl && (
          <WebView
            source={{ uri: currentUrl }}
            ref={webviewRef}
            sharedCookiesEnabled={true}
            injectedJavaScriptBeforeContentLoaded={webViewAuth.script}
            onMessage={handleMessage}
            renderError={() => (
              <View>
                <Text>{t("common.errorRetrying")}</Text>
              </View>
            )}
            userAgent={Platform.OS === "ios" ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148" : undefined}
            scalesPageToFit={false}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            allowsBackForwardNavigationGestures={true}
            mediaPlaybackRequiresUserAction={false}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        )}
      </View>
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <Loader isLoading={isLoading} />
        </View>
      )}
    </View>
  );
}
