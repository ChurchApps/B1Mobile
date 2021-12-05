import * as React from 'react';
import { Image, View } from 'react-native';
import { globalStyles } from '../helpers';
import Images from '../utils/Images';

export function BlueHeader() {
  return (
    <View style={globalStyles.headerContainer}>
      <View style={globalStyles.blueLogoView}>
        <Image source={Images.logoWhite} style={globalStyles.blueMainIcon} />
      </View>
    </View>
  );
};
