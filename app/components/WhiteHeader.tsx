import * as React from 'react';
import { Image, NativeModules, View } from 'react-native';
import { Constants, globalStyles } from '@/src/helpers';
import { MainHeader } from './wrapper/MainHeader';
const { StatusBarManager } = NativeModules;

interface Props {
  onPress: () => void;
  title?: string;
}

export function WhiteHeader(props: Props) {

  //TODO: Pull in churches logo
  const logoSrc = Constants.Images.logoBlue;

  return (
    <View>
      <MainHeader title={props.title || ""} hideBell={true} />
      <View style={logoSrc}>
        <Image source={Constants.Images.logoBlue} style={globalStyles.whiteMainIcon} />
      </View>
    </View>
  );
};
