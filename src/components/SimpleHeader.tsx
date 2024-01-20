import * as React from 'react';
import { Image, NativeModules, Text, TouchableOpacity } from 'react-native';
import { Constants, globalStyles } from '../helpers';
import { MainHeader } from './wrapper/MainHeader';
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

  return <MainHeader title={props.title} hideBell={true} /> 
};
