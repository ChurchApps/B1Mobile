import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';

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
    >
      {props.onPress && (
        <Appbar.Action icon="menu" onPress={props.onPress} color={theme.colors.onPrimary} />
      )}
      <Appbar.Content title={props.title} />
    </Appbar.Header>
  );
};
