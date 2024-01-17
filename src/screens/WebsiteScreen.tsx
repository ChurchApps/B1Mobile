import React, { useState, useEffect, FunctionComponent } from 'react';
import { View, SafeAreaView, TouchableOpacity, Image, Text } from 'react-native';
import { UserHelper, Utilities } from '../helpers';
import WebView from 'react-native-webview';
import { Loader, MainHeader, NotificationTab } from '../components';
import { globalStyles, Constants, ApiHelper } from '../helpers';
import { eventBus } from '../helpers/PushNotificationHelper';

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
  const [badgeCount, setBadgeCount] = useState(0);  
  const checkRedirect = () => {
    if (!UserHelper.currentUserChurch) props.navigation.navigate("ChurchSearch")
  }

  useEffect(() => {
    Utilities.trackEvent("Website Screen", { url: props.route?.params?.url });
    checkRedirect();
  }, [])
  useEffect(() => {
    const handleNewMessage = () => {
      setBadgeCount((prevCount) => prevCount + 1);
    };
    eventBus.addListener("badge", handleNewMessage);
    return () => {
      eventBus.removeListener("badge");
    };
  });

  const getTitle = () => {
    const title = params && params.title && params.title;
    return title == undefined ? 'Home' : title;
  }
  const RightComponent = (
    <TouchableOpacity onPress={() => { toggleTabView() }}>
      {badgeCount > 0 ?
        <View style={{ flexDirection: 'row' }}>
          <Image source={Constants.Images.dash_bell} style={globalStyles.BadgemenuIcon} />
          <View style={globalStyles.BadgeDot}></View>
        </View>
        : <View>
          <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
        </View>}
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
    setBadgeCount(0)
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