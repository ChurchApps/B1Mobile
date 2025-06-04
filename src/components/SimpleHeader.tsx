import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { NativeModules } from 'react-native'; // Keep for StatusBarManager if still needed, otherwise remove

const { StatusBarManager } = NativeModules; // May not be needed if Appbar handles status bar padding

interface Props {
  onPress?: () => void; // Assuming this is for a menu/drawer icon
  title: string;
  // Add other props like goBack if a back action is sometimes needed
  // showBackButton?: boolean;
  // onGoBack?: () => void;
}

export function SimpleHeader(props: Props) {
  const theme = useTheme();

  return (
    <Appbar.Header
      style={{ backgroundColor: theme.colors.primary }}
      // statusBarHeight={StatusBarManager.HEIGHT} // Appbar.Header usually handles this
    >
      {props.onPress && (
        <Appbar.Action icon="menu" onPress={props.onPress} color={theme.colors.onPrimary} />
      )}
      <Appbar.Content title={props.title} titleStyle={{ color: theme.colors.onPrimary }} />
    </Appbar.Header>
  );
};
