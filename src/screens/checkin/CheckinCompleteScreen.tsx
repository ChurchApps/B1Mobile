import React, { useEffect } from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MainHeader } from '../../components';
import { Constants, UserHelper, globalStyles } from '../../helpers';
import { NavigationProps } from '../../interfaces';

interface Props {
  navigation: NavigationProps;
}

const CheckinCompleteScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;

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
    setTimeout(() => { navigate('ServiceScreen', {}) }, 1000);
  }
  
  const logoSrc = Constants.Images.logoBlue;
  return (
    <SafeAreaView style={globalStyles.grayContainer}>
      <ScrollView>
        <MainHeader title="Checkin" openDrawer={props.navigation.openDrawer} />
        <SafeAreaView style={globalStyles.safeAreaContainer}> 
        <View style={logoSrc}>
        <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
      </View>
          <Icon name={'check-circle'} style={globalStyles.successIcon} size={wp('20%')} />
          <Text style={globalStyles.successText}>Checkin Complete.</Text>
        </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckinCompleteScreen;
