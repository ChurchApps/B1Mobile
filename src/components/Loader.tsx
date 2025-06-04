import { globalStyles } from "@/src/helpers";
import React from 'react';
import { ActivityIndicator as PaperActivityIndicator, useTheme } from 'react-native-paper';

interface Props {
  isLoading: boolean; // Changed type from any to boolean for clarity
  size?: 'small' | 'large' | number; // Allow size customization
  color?: string; // Allow color customization, defaulting to theme
}

export function Loader({ isLoading, size = 'large', color }: Props) {
  const theme = useTheme();
  const indicatorColor = color || theme.colors.primary; // Default to theme.colors.primary

  return (
    <PaperActivityIndicator
      style={globalStyles.indicatorStyle} // Keep existing global style for positioning
      size={size}
      color={indicatorColor}
      animating={isLoading}
    />
  );
}
