import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from '../constants/Colors';

export const AppLightTheme = {
  ...MD3LightTheme,
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
