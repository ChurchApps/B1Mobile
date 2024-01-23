import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import WebView from 'react-native-webview';
import { Loader, MainHeader } from '../components';
import { UserHelper, Utilities, globalStyles } from '../helpers';
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

  const checkRedirect = () => {
    console.log("WEBSITE CHECK REDIRECT", UserHelper.currentUserChurch?.church?.name)
    if (!UserHelper.currentUserChurch) props.navigation.navigate("ChurchSearch", {})
  }

  useEffect(() => {
    Utilities.trackEvent("Website Screen", { url: props.route?.params?.url });
    checkRedirect();
  }, [])

  const getTitle = () => {
    const title = params && params.title && params.title;
    return title == undefined ? 'Home' : title;
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader title={getTitle()} openDrawer={props.navigation.openDrawer} />
      <>
        <View style={globalStyles.webViewContainer}>
          <WebView onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} source={{ uri: params?.url }} scalesPageToFit={false} />
        </View>

        {isLoading && <Loader isLoading={isLoading} />}
      </>
    </SafeAreaView>
  );
};