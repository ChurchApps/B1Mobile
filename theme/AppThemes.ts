// @ts-nocheck
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Colors } from '../constants/Colors';

const paperFontConfig = {
  ios: {
    regular: { fontFamily: 'Roboto-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
  },
  android: {
    regular: { fontFamily: 'Roboto-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
  },
  web: {
    regular: { fontFamily: 'Roboto-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
  },
  default: { // Add default as a fallback, mirroring android/ios
    regular: { fontFamily: 'Roboto-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
  }
};

const configuredFonts = configureFonts({config: paperFontConfig, isV3: true});

export const AppLightTheme = {
  ...MD3LightTheme,
  fonts: configuredFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    surface: Colors.light.card,
    text: Colors.light.text,
    onSurface: Colors.light.text,
    placeholder: Colors.light.gray,
    // accent is deprecated in v5, using secondary instead for compatibility
    secondary: Colors.light.tint,
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  fonts: configuredFonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    surface: Colors.dark.card,
    text: Colors.dark.text,
    onSurface: Colors.dark.text,
    placeholder: Colors.dark.gray,
    // accent is deprecated in v5, using secondary instead for compatibility
    secondary: Colors.dark.tint,
  },
};
