import * as React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Constants, globalStyles } from '../../helpers';
import { NotificationTab } from '../NotificationView';
import { HeaderBell } from './HeaderBell';

interface Props {
  title: string,
  openDrawer?: () => void
  hideBell?: boolean
}

export function MainHeader(props: Props) {

  const [showNotifications, setShowNotifications] = React.useState(false);

  const LeftComponent = (props.openDrawer) 
    ? (<TouchableOpacity onPress={() => { if (props.openDrawer) props.openDrawer(); }}><Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} /></TouchableOpacity>)
    : null;

    
  return ( 
    <>
      <View style={globalStyles.headerViewStyle}>
        <View style={[globalStyles.componentStyle, { flex: 2, justifyContent: 'flex-start' }]}>{LeftComponent}</View>
        <View style={[globalStyles.componentStyle, { flex: 6.3 }]}><Text style={globalStyles.headerText}>{props.title}</Text></View>
        <View style={[globalStyles.componentStyle, { flex: 1.7, justifyContent: 'flex-end' }]}>
          { !props.hideBell && <HeaderBell toggleNotifications={() => { setShowNotifications(!showNotifications); }} /> }
        </View>
      </View>
      { showNotifications && <NotificationTab /> }
    </>
  );

  
};
