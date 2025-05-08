import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, SafeAreaView, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { Loader, MainHeader } from '../components';
import { CacheHelper, Utilities, globalStyles } from '../helpers';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps;
  route: {
    params: {
      url: any,
      title: string
    }
  };
}

const urlToScreenMapping: { [key: string]: string } = {
  '/donate': 'DonationScreen',
  '/groups/details/': 'GroupDetails',
  '/my/checkin': 'ServiceScreen',
  '/my/community': 'MembersSearch',
  '/my/community/': 'MemberDetailScreen',
  '/my/groups': 'MyGroups',
  '/my/plans': 'PlanScreen',
  '/my/plans/': 'PlanDetails',
  '/votd': 'VotdScreen',
};

export const WebsiteScreen = (props: Props) => {
  const { params } = props.route;
  const [isLoading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const webviewRef = useRef<any>();
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  //console.log(params?.url)

  const checkRedirect = () => {
    if (!CacheHelper.church) props.navigation.navigate("ChurchSearch", {})
  }

  useEffect(() => {
    Utilities.trackEvent("Website Screen", { url: props.route?.params?.url });
    checkRedirect();
  }, [])

  const getTitle = () => {
    const title = params && params.title && params.title;
    return title == undefined ? 'Home' : title;
  }

  const extractIdFromUrl = (url: string, basePath: string) => {
    if (url.startsWith(basePath)) {
      return url.replace(basePath, '').split('?')[0];
    }
    return null;
  };

  const handleWebViewNavigationStateChange = (event: any) => {
    const { url } = event;

    // Dynamically extract base URL
    const baseUrlMatch = url.match(/^(https?:\/\/[^/]+)/);
    const baseUrl = baseUrlMatch ? baseUrlMatch[1] : '';

    if (url.includes('/donate')) {
      if (Platform.OS === 'android') {
        props.navigation.navigate('DonationScreen');
        return false;
      } else if (Platform.OS === 'ios') {
        return true;
      }
    }

    for (const basePath in urlToScreenMapping) {
      const screenName = urlToScreenMapping[basePath];

      if (basePath.endsWith('/')) {
        const fullUrl = `${baseUrl}${basePath}`;
        const id = extractIdFromUrl(url, fullUrl);
        if (id) {
          props.navigation.navigate(screenName, { id });
          return false;
        }
      } else if (url === `${baseUrl}${basePath}`) {
        props.navigation.navigate(screenName);
        return false;
      }
    }

    return true;
  };

  const handleMessage = (event: any) => {

    console.log("MADE IT")
    console.log("RECEIVED MESSAGE", event.nativeEvent.data);
    let newUrl = currentUrl + "&autoPrint=1"
    Linking.openURL(newUrl);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentUrl(params?.url);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={getTitle()} openDrawer={props.navigation.openDrawer} back={props.navigation.goBack} />
      <>
        <View style={globalStyles.webViewContainer} onLayout={() => setIsLayoutReady(true)}>
          {isLayoutReady && (
            <WebView
              source={currentUrl ? { uri: params?.url } : undefined}

              ref={webviewRef}
              onMessage={handleMessage}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              // onNavigationStateChange={(state: any) => { setCurrentUrl(state.url) }}
              // source={{ uri: params?.url }}
              renderLoading={() => <Loader isLoading={isLoading} />}
              renderError={(errorName) => (
                <View>
                  <Text>Oops, something went wrong. Retrying...</Text>
                </View>
              )}
              userAgent={
                Platform.OS === 'ios'
                  ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
                  : undefined
              }
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
      </>
    </SafeAreaView>
  );
};
