import React, { useState,  } from 'react';
import { View, SafeAreaView, Image, Dimensions, Text, TouchableOpacity } from 'react-native';
import { MainHeader, NotificationTab } from '../components';
import { globalStyles, Utilities, Constants, ApiHelper } from '../helpers';
import { eventBus } from '../helpers/PushNotificationHelper';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const VotdScreen = (props: Props) => {
  const { openDrawer } = props.navigation;
  const [shape, setShape] = React.useState("9x16");
  const [NotificationModal, setNotificationModal] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const getShape = () => {
    const dim = Dimensions.get("screen");
    const width = dim.width;
    const height = dim.height;
    const ratio = width / height;
    const diff1x1 = Math.abs(ratio - 1);
    const diff16x9 = Math.abs(ratio - 1.777);
    const diff9x16 = Math.abs(ratio - 0.5625);
    let result = "1x1";
    if (diff16x9 < diff1x1) result = "16x9";
    else if (diff9x16 < diff1x1) result = "9x16"
    setShape(result);
  }

  const getDayOfYear = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
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
  React.useEffect(() => {
    Utilities.trackEvent("VOTD Screen");
    getShape();
    Dimensions.addEventListener("change", getShape);
  }, []);
  React.useEffect(() => {
    const handleNewMessage = () => {
      setBadgeCount((prevCount) => prevCount + 1);
    };
    eventBus.addListener("badge", handleNewMessage);
    return () => {
      eventBus.removeListener("badge");
    };
  }, []);
 
  const day = getDayOfYear();
  const url = "https://votd.org/v1/" + day.toString() + "/" + shape + ".jpg";

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <MainHeader
        leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
          <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
        </TouchableOpacity>}
        mainComponent={<Text style={globalStyles.headerText}>Verse of the Day</Text>}
        rightComponent={RightComponent}
      />
      <View style={globalStyles.webViewContainer}>
        <Image source={{ uri: url }} style={{ flex: 1 }} resizeMode="stretch" />
      </View>
      {
        NotificationModal ?
          <NotificationTab /> : null
      }
    </SafeAreaView>
  );
};