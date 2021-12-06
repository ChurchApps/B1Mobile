import * as React from 'react';
import { Image, View } from 'react-native';
import { globalStyles } from '../helpers';
import { Constants } from '../helpers';

export function BlueHeader() {
  return (
    <View style={globalStyles.headerContainer}>
      <View style={globalStyles.blueLogoView}>
        <Image source={Constants.Images.logoWhite} style={globalStyles.blueMainIcon} />
      </View>
    </View>
  );
};
