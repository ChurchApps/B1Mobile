import * as React from 'react';
import { Image, NativeModules, Platform, Text, TouchableOpacity, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants, UserHelper } from '../helpers';
import { globalStyles } from '../helpers';
import { MainHeader } from './MainHeader';
const { StatusBarManager } = NativeModules;

interface Props {
  onPress: () => void;
  title?: string;
}

export function WhiteHeader(props: Props) {
  const leftComponent = (<TouchableOpacity onPress={() => props.onPress()}>
    <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
  </TouchableOpacity>);

  const mainComponent = (<Text style={globalStyles.headerText}>{props.title}</Text>);

  //TODO: Pull in churches logo
  const logoSrc = Constants.Images.logoBlue;

  return (
    <View>
      <MainHeader leftComponent={leftComponent} mainComponent={mainComponent} rightComponent={null} />
      <View style={logoSrc}>
        <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
      </View>
    </View>
  );
};
