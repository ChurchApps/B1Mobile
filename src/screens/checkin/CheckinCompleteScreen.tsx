import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WhiteHeader, MainHeader, NotificationTab } from '../../components';
import { globalStyles, UserHelper, Constants, ApiHelper } from '../../helpers';
import { eventBus } from '../../helpers/PushNotificationHelper';


interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
    openDrawer: () => void;
    addListener: (type: string, callback: any) => void;
  };
}

const CheckinCompleteScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [NotificationModal, setNotificationModal] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    UserHelper.addOpenScreenEvent('CheckinCompleteScreen');
    serviceNavigate();
  }, []);

  useEffect(() => {
    const handleNewMessage = () => {
      setBadgeCount((prevCount) => prevCount + 1);
    };
    eventBus.addListener("badge", handleNewMessage);
     return () => {
      eventBus.removeListener("badge");
    };
  });
  useEffect(() => {
    serviceNavigate();
    const init = props.navigation.addListener('focus', async () => { serviceNavigate() });
    return init;
  }, [props.navigation]);

  const serviceNavigate = () => {
    setTimeout(() => { navigate('ServiceScreen') }, 1000);
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
  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <ScrollView>
        <MainHeader
          leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
            <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
          </TouchableOpacity>}
          mainComponent={<Text style={globalStyles.headerText}>Checkin</Text>}
          rightComponent={RightComponent}
        />
        <SafeAreaView style={globalStyles.safeAreaContainer}> 
        <View style={logoSrc}>
        <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
      </View>
          <Icon name={'check-circle'} style={globalStyles.successIcon} size={wp('20%')} />
          <Text style={globalStyles.successText}>Checkin Complete.</Text>
        </SafeAreaView>
      </ScrollView>
      {
        NotificationModal ?
          <NotificationTab /> : null
      }
    </SafeAreaView>
  );
};

export default CheckinCompleteScreen;
