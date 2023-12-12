import React, { useState, useEffect, FunctionComponent } from 'react';
import { View, SafeAreaView, TouchableOpacity, Image, Text } from 'react-native';
import { UserHelper, Utilities } from '../helpers';
import WebView from 'react-native-webview';
import { Loader, MainHeader, NotificationTab } from '../components';
import { globalStyles, Constants } from '../helpers';

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
  const [NotificationModal, setNotificationModal] = useState(false);

  const checkRedirect = () => {
    if (!UserHelper.currentUserChurch) props.navigation.navigate("ChurchSearch")
  }

  useEffect(() => {
    Utilities.trackEvent("Website Screen", { url: props.route?.params?.url });
    checkRedirect();
  }, [])

  const getTitle = () => {
    const title = params && params.title && params.title;
    return title == undefined ? 'Home' : title;
  }
  const RightComponent = (
    <TouchableOpacity onPress={() => toggleTabView()}>
      <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader
        leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>}
        mainComponent={<Text style={globalStyles.headerText}>{getTitle()}</Text>}
        rightComponent={RightComponent}
      />
      <>
        <View style={globalStyles.webViewContainer}>
          <WebView onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} source={{ uri: params?.url }} scalesPageToFit={false} />
        </View>

        {isLoading && <Loader isLoading={isLoading} />}
      </>
      {NotificationModal ?
        <NotificationTab /> : null}
    </SafeAreaView>
  );
};