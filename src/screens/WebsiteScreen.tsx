import React, { useEffect, useRef, useState } from 'react';
import { Linking, SafeAreaView, View } from 'react-native';
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

export const WebsiteScreen = (props: Props) => {
  const { params } = props.route;
  const [isLoading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const webviewRef = useRef<any>();
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

  const handleMessage = (event: any) => {

    console.log("MADE IT")
    console.log("RECEIVED MESSAGE", event.nativeEvent.data);
    let newUrl = currentUrl + "&autoPrint=1"
    Linking.openURL(newUrl);
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={getTitle()} openDrawer={props.navigation.openDrawer} back={props.navigation.goBack}/>
      <>
        <View style={globalStyles.webViewContainer}>
          <WebView ref={webviewRef} onMessage={handleMessage} onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} onNavigationStateChange={(state:any) => { setCurrentUrl(state.url) }} source={{ uri: params?.url }} scalesPageToFit={false} />
        </View>

        {isLoading && <Loader isLoading={isLoading} />}
      </>
    </SafeAreaView>
  );
};