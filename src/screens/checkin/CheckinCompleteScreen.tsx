import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WhiteHeader, MainHeader, NotificationTab } from '../../components';
import { globalStyles, UserHelper, Constants } from '../../helpers';


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

  useEffect(() => {
    UserHelper.addOpenScreenEvent('CheckinCompleteScreen');
    serviceNavigate();
  }, []);

  useEffect(() => {
    serviceNavigate();
    const init = props.navigation.addListener('focus', async () => { serviceNavigate() });
    return init;
  }, [props.navigation]);

  const serviceNavigate = () => {
    setTimeout(() => { navigate('ServiceScreen') }, 1000);
  }
  const RightComponent = (
    <TouchableOpacity onPress={() => toggleTabView()}>
      <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
    </TouchableOpacity>
  );

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
  };
  const logoSrc = Constants.Images.logoBlue;
  return (
    <View style={globalStyles.grayContainer}>
      <ScrollView>
        <MainHeader
          leftComponent={<TouchableOpacity onPress={() => openDrawer()}>
            <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
          </TouchableOpacity>}
          mainComponent={<Text style={globalStyles.headerText}>Checkin</Text>}
          rightComponent={RightComponent}
        />
        <View style={logoSrc}>
          <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
        </View>

        <SafeAreaView style={globalStyles.safeAreaContainer}>
          <Icon name={'check-circle'} style={globalStyles.successIcon} size={wp('20%')} />
          <Text style={globalStyles.successText}>Checkin Complete.</Text>
        </SafeAreaView>
      </ScrollView>
      {
        NotificationModal ?
          <NotificationTab /> : null
      }
    </View>
  );
};

export default CheckinCompleteScreen;
