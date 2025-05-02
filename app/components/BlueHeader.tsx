import { Constants, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@churchapps/mobilehelper';
import Fontisto from '@expo/vector-icons/Fontisto';
import { router } from 'expo-router';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

interface Props {
  navigation?: {
    navigate?: (screenName: string, params?: any) => void;
    openDrawer?: () => void;
  };
  showBack?: Boolean,
  showMenu?: Boolean,
}

export function BlueHeader(props: Props) {
  return (
    <View style={globalStyles.headerContainer}>
      <View style={globalStyles.blueLogoView}>
        {(props.showBack && props.navigation != undefined) ? <View style={globalStyles.blueMainBackIcon}>
          <TouchableOpacity onPressIn={() => { router.back() }}>
            <Fontisto name={'angle-left'} color={Constants.Colors.white_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
          </TouchableOpacity>
        </View> : null}
        {(props.showMenu && props.navigation?.openDrawer != undefined) ?
          <View style={[globalStyles.blueMainBackIcon, { marginTop: DimensionHelper.wp('6%'), marginLeft: DimensionHelper.wp('3%') }]}>
            <TouchableOpacity onPressIn={() => { props?.navigation?.openDrawer != undefined ? props?.navigation?.openDrawer() : null }}>
              <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
            </TouchableOpacity>
          </View> : null}
        <Image source={Constants.Images.logoWhite} style={globalStyles.blueMainIcon} />
      </View>
    </View>
  );
};

BlueHeader.defaultProps = {
  showBack: false,
  showMenu: false,
}
