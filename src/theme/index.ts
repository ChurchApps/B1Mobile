import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from "react-native-paper";
import { Platform } from "react-native";

// Custom font configuration
const fontConfig = {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System"
  })
};

// Custom colors that extend Paper's theme
const customColors = {
  primary: "#1C75BC",
  secondary: "#5E60CE",
  error: "#B00020",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  onSurface: "#000000",
  onSurfaceVariant: "#666666",
  onSurfaceDisabled: "#999999",
  onPrimary: "#FFFFFF",
  onBackground: "#000000",
  onError: "#FFFFFF"
};

// Custom component styles that can be reused
export const componentStyles = {};

// Extend Paper's theme with our custom values
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
    background: "#121212",
    surface: "#1E1E1E",
    surfaceVariant: "#2D2D2D",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#CCCCCC",
    onBackground: "#FFFFFF"
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8
};

// Custom hook to use our theme and styles
export const useAppTheme = () => {
  const theme = useTheme();
  return {
    theme,
    componentStyles
  };
};
