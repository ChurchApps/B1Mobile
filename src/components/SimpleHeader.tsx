import * as React from 'react';
import { Image, NativeModules, Text, TouchableOpacity} from 'react-native';
import { Constants } from '../helpers';
import { globalStyles } from '../helpers';
import { MainHeader } from './MainHeader';
const { StatusBarManager } = NativeModules;

interface Props {
  onPress: () => void;
  title: string;
}

export function SimpleHeader(props: Props) {
  const leftComponent = (<TouchableOpacity onPress={() => props.onPress()}>
    <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
  </TouchableOpacity>);

  const mainComponent = (<Text style={globalStyles.headerText}>{props.title}</Text>);

  return <MainHeader leftComponent={leftComponent} mainComponent={mainComponent} rightComponent={null} />
};
