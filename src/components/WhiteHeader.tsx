import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { NativeModules } from 'react-native'; // Keep for StatusBarManager if still needed

const { StatusBarManager } = NativeModules; // May not be needed if Appbar handles status bar padding

interface Props {
  onPress?: () => void; // Assuming this is for a menu/drawer icon
  title?: string;
  // Add other props like goBack if a back action is sometimes needed
  // showBackButton?: boolean;
  // onGoBack?: () => void;
}

export function WhiteHeader(props: Props) {
  const theme = useTheme();

  // Determine icon and title colors based on a light background
  const contentColor = theme.colors.onSurface; // Or theme.colors.primary if a colored accent is desired on white

  return (
    <Appbar.Header
      style={{ backgroundColor: theme.colors.surface }}
      // statusBarHeight={StatusBarManager.HEIGHT} // Appbar.Header usually handles this
    >
      {/* Optional: Back action if this header sometimes needs it */}
      {/* {props.showBackButton && props.onGoBack && (
        <Appbar.BackAction onPress={props.onGoBack} color={contentColor} />
      )} */}

      {props.onPress && (
        <Appbar.Action icon="menu" onPress={props.onPress} color={contentColor} />
      )}

      {props.title && (
        <Appbar.Content title={props.title} titleStyle={{ color: contentColor }} />
      )}

      {/* If there's no title but an action (menu) button,
          Appbar.Content can be used to fill space or be omitted.
          If a logo were to be displayed, it could be in Appbar.Content title (if small)
          or as a standalone Image component if the layout is more complex (like BlueHeader).
          For now, focusing on title and menu action.
      */}
      {!props.title && props.onPress && <Appbar.Content title="" />}
      {/* ^ This pushes menu to the right if no title */}

    </Appbar.Header>
  );
}
