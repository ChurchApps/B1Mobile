import { Constants, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import React from 'react';
import { Platform } from 'react-native'; // Platform is still needed
import { Appbar, useTheme } from 'react-native-paper';
// NotificationTab and HeaderBell are removed as per subtask instructions.
// Their functionality (displaying notifications and the bell icon itself) will be handled differently.

interface Props {
  title: string;
  back?: () => void;
  openDrawer?: () => void;
  hideBell?: boolean;
  onToggleNotifications?: () => void; // New prop for handling bell press
}

export function MainHeader(props: Props) {
  const theme = useTheme();
  // Appbar.Header handles safe area insets by default.

  // Define a base style for the title, ensuring white color from constants
  // and allowing textAlign to be overridden if Appbar.Content centers it well by default.
  const titleStyle = {
    ...globalStyles.headerText, // fontSize, fontWeight
    color: Constants.Colors.white_color,
    // textAlign: 'center', // Appbar.Content might center by default or require specific alignment props.
    // flex: 1, // Let Appbar.Content manage its own flex properties.
  };

  return (
    <Appbar.Header
      style={{
        backgroundColor: Constants.Colors.app_color, // from globalStyles.headerViewStyle
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Left Actions */}
      {Platform.OS === 'ios' && props.back ? (
        <Appbar.BackAction onPress={props.back} color={Constants.Colors.white_color} size={DimensionHelper.hp(3.5)} />
      ) : props.openDrawer ? (
        <Appbar.Action icon="menu" onPress={props.openDrawer} color={Constants.Colors.white_color} size={DimensionHelper.wp(6)} />
      ) : (
        // Spacer if no left actions, to help center title if Appbar.Content doesn't fill
        // Or if there's only a right action.
        // Adjust width as needed, typically same as an Appbar.Action
        <Appbar.Action icon="" style={{width: DimensionHelper.wp(6), opacity:0}} disabled />
      )}

      {/* Title */}
      <Appbar.Content
        title={props.title}
        titleStyle={titleStyle}
        style={{ alignItems: 'center' }} // Attempt to center title; might need adjustment
      />

      {/* Right Actions */}
      {!props.hideBell && props.onToggleNotifications ? (
        <Appbar.Action icon="bell-outline" onPress={props.onToggleNotifications} color={Constants.Colors.white_color} size={DimensionHelper.wp(6)} />
      ) : (
        // Spacer if no right actions, to help center title
         <Appbar.Action icon="" style={{width: DimensionHelper.wp(6), opacity:0}} disabled />
      )}
    </Appbar.Header>
  );
}
