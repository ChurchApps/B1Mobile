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
  background: "#F6F6F8",
  surface: "#FFFFFF",
  surfaceVariant: designSystem.colors.neutral[50],
  onSurface: designSystem.colors.neutral[900],
  onSurfaceVariant: designSystem.colors.neutral[500],
  onSurfaceDisabled: designSystem.colors.neutral[500],
  onPrimary: "#FFFFFF",
  onBackground: designSystem.colors.neutral[900],
  onError: "#FFFFFF",
  elevation: {
    level0: "transparent",
    level1: "#FFFFFF",
    level2: "#F8F9FA",
    level3: "#F0F0F0",
    level4: "#E9ECEF",
    level5: "#E2E6EA"
  }
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
    onBackground: "#FFFFFF",
    elevation: {
      level0: "transparent",
      level1: "#1E1E1E",
      level2: "#232323",
      level3: "#282828",
      level4: "#2D2D2D",
      level5: "#323232"
    }
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: designSystem.borderRadius.md
};

// Custom hook to use our theme and styles
export const useAppTheme = () => {
  const theme = useTheme();
  const isDark = theme.dark;
  return {
    theme,
    isDark,
    componentStyles,
    spacing: designSystem.spacing,
    colors: designSystem.colors,
    typography: designSystem.typography,
    borderRadius: designSystem.borderRadius,
    shadows: designSystem.shadows
  };
};

// Hook that returns semantic colors based on current theme
export const useThemeColors = () => {
  const theme = useTheme();
  const isDark = theme.dark;

  return {
    isDark,
    // Backgrounds
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceVariant: theme.colors.surfaceVariant,
    // Text
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    // Brand
    primary: theme.colors.primary,
    onPrimary: theme.colors.onPrimary,
    // UI elements
    border: isDark ? "#333333" : "#F0F0F0",
    card: theme.colors.surface,
    headerBg: designSystem.colors.primary[500],
    inputBorder: isDark ? "#444444" : "lightgray",
    inputText: isDark ? "#E0E0E0" : "gray",
    shadow: isDark ? "#000000" : designSystem.colors.primary[500],
    overlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.5)",
    // Quick action / icon backgrounds
    iconBackground: isDark ? "#2D2D2D" : "#F6F6F8",
  };
};
