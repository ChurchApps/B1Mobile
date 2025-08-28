import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Linking, Platform, SafeAreaView, View, Text } from "react-native";
import WebView from "react-native-webview";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { CacheHelper, globalStyles } from "../../src/helpers";
import { MainHeader } from "./wrapper/MainHeader";
import { UserHelper } from "../helpers/UserHelper";

interface WebsiteScreenProps {
  url: string;
  title: string;
}

export function WebsiteScreen({ url, title }: WebsiteScreenProps) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    // Utilities.trackEvent('Website Screen', { url });
    //if (!CacheHelper.church) router.navigate("/(drawer)/churchSearch");
    UserHelper.addOpenScreenEvent("Website Screen", { url });

    const timer = setTimeout(() => {
      setCurrentUrl(url);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleMessage = () => {
    let newUrl = currentUrl + "&autoPrint=1";
    Linking.openURL(newUrl);
  };

  const urlToScreenMapping: { [key: string]: string } = {
    "/donate": "/(drawer)/donation",
    "/groups/details/": "/(drawer)/groupDetails",
    "/my/checkin": "/(drawer)/service",
    "/my/community": "/(drawer)/membersSearch",
    "/my/community/": "/(drawer)/memberDetail",
    "/my/groups": "/(drawer)/myGroups",
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

    // Dynamically extract base URL
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

  //renderLoading={() => <Loader isLoading={isLoading} />}

  return (
    <View style={globalStyles.homeContainer}>
      <MainHeader title={title || "Home"} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => router.back()} />
      <View style={globalStyles.webViewContainer} onLayout={() => setIsLayoutReady(true)}>
        {isLayoutReady && (
          <WebView
            source={currentUrl ? { uri: url } : undefined}
            ref={webviewRef}
            onMessage={handleMessage}
            renderError={() => (
              <View>
                <Text>Oops, something went wrong. Retrying...</Text>
              </View>
            )}
            userAgent={Platform.OS === "ios" ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148" : undefined}
            scalesPageToFit={false}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            allowsBackForwardNavigationGestures={true}
            mediaPlaybackRequiresUserAction={false}
            // onShouldStartLoadWithRequest={handleWebViewNavigationStateChange}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        )}
      </View>
    </View>
  );
}
