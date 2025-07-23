import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from "react-native-paper";
import { Platform } from "react-native";
import { designSystem } from "./designSystem";

// Custom font configuration
const fontConfig = {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System"
  })
};

// Custom colors that extend Paper's theme using our design system
const customColors = {
  primary: designSystem.colors.primary[500],
  secondary: designSystem.colors.secondary[500],
  error: designSystem.colors.error[500],
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceVariant: designSystem.colors.neutral[50],
  onSurface: designSystem.colors.neutral[900],
  onSurfaceVariant: designSystem.colors.neutral[500],
  onSurfaceDisabled: designSystem.colors.neutral[500],
  onPrimary: "#FFFFFF",
  onBackground: designSystem.colors.neutral[900],
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
  roundness: designSystem.borderRadius.md
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
  roundness: designSystem.borderRadius.md
};

// Custom hook to use our theme and styles
export const useAppTheme = () => {
  const theme = useTheme();
  return {
    theme,
    componentStyles,
    spacing: designSystem.spacing,
    colors: designSystem.colors,
    typography: designSystem.typography,
    borderRadius: designSystem.borderRadius,
    shadows: designSystem.shadows
  };
};
