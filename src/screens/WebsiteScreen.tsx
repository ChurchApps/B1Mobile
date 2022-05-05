import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import { UserHelper } from '../helpers';
import WebView from 'react-native-webview';
import { Loader, SimpleHeader } from '../components';
import { globalStyles } from '../helpers';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
  route: {
    params: {
      url: any,
      title: string
    }
  };
}

export const WebsiteScreen = (props: Props) => {
  const { openDrawer } = props.navigation;
  const { params } = props.route;
  const [isLoading, setLoading] = useState(false);

  const checkRedirect = () => {
    if (!UserHelper.currentChurch) props.navigation.navigate("ChurchSearch")
  }

  useEffect(() => {
    checkRedirect();
  }, [])

  const getTitle = () => {
    const title = params && params.title && params.title;
    return title == undefined ? 'Home' : title;
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <SimpleHeader onPress={() => openDrawer()} title={getTitle()} />
      <View style={globalStyles.webViewContainer}>
        <WebView onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} source={{ uri: params && params.url && params.url }} scalesPageToFit={false} />
      </View>
      {isLoading && <Loader isLoading={isLoading} />}
    </SafeAreaView>
  );
};