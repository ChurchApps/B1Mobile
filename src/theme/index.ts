import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from "react-native-paper";
import { Platform } from "react-native";
import { designSystem } from "./designSystem";
import type { AppThemeModeColors } from "../stores/useChurchStore";

// Custom font configuration
const fontConfig = {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System"
  })
};

// Custom component styles that can be reused
export const componentStyles = {};

// Factory function to create a Paper theme with optional church color overrides
export function createAppTheme(mode: "light" | "dark", churchColors?: AppThemeModeColors | null) {
  const baseTheme = mode === "light" ? MD3LightTheme : MD3DarkTheme;
  const fonts = configureFonts({ config: fontConfig });
  const roundness = designSystem.borderRadius.md;

  if (mode === "light") {
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: churchColors?.primary || designSystem.colors.primary[500],
        secondary: churchColors?.secondary || designSystem.colors.secondary[500],
        error: designSystem.colors.error[500],
        background: churchColors?.background || "#F6F6F8",
        surface: churchColors?.surface || "#FFFFFF",
        surfaceVariant: designSystem.colors.neutral[50],
        onSurface: churchColors?.textColor || designSystem.colors.neutral[900],
        onSurfaceVariant: designSystem.colors.neutral[500],
        onSurfaceDisabled: designSystem.colors.neutral[500],
        onPrimary: churchColors?.primaryContrast || "#FFFFFF",
        onBackground: churchColors?.textColor || designSystem.colors.neutral[900],
        onError: "#FFFFFF",
        elevation: {
          level0: "transparent",
          level1: churchColors?.surface || "#FFFFFF",
          level2: "#F8F9FA",
          level3: "#F0F0F0",
          level4: "#E9ECEF",
          level5: "#E2E6EA"
        }
      },
      fonts,
      roundness
    };
  }

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: churchColors?.primary || designSystem.colors.primary[500],
      secondary: churchColors?.secondary || designSystem.colors.secondary[500],
      error: designSystem.colors.error[500],
      onPrimary: churchColors?.primaryContrast || "#FFFFFF",
      background: churchColors?.background || "#121212",
      surface: churchColors?.surface || "#1E1E1E",
      surfaceVariant: "#2D2D2D",
      onSurface: churchColors?.textColor || "#FFFFFF",
      onSurfaceVariant: "#CCCCCC",
      onBackground: churchColors?.textColor || "#FFFFFF",
      elevation: {
        level0: "transparent",
        level1: churchColors?.surface || "#1E1E1E",
        level2: "#232323",
        level3: "#282828",
        level4: "#2D2D2D",
        level5: "#323232"
      }
    },
    fonts,
    roundness
  };
}

// Default themes (no church overrides)
export const lightTheme = createAppTheme("light");
export const darkTheme = createAppTheme("dark");

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
    textMuted: isDark ? "#888888" : "#666666",
    textHint: isDark ? "#777777" : "#999999",
    // Brand
    primary: theme.colors.primary,
    primaryLight: isDark ? "#1a3a5c" : designSystem.colors.primary[50],
    secondary: theme.colors.secondary,
    onPrimary: theme.colors.onPrimary,
    // Status
    success: designSystem.colors.success[500],
    successLight: isDark ? "#1a3a1a" : "#E8F5E9",
    successBg: isDark ? "#0d2b0d" : "#F8FFF8",
    warning: designSystem.colors.warning[500],
    warningLight: isDark ? "#3a2a0a" : "#FFF8E1",
    warningBg: isDark ? "#2b1f05" : "#FFF3E0",
    error: designSystem.colors.error[500],
    errorLight: isDark ? "#3a1a1a" : "#FFEBEE",
    errorBg: isDark ? "#2b0d0d" : "#FEE2E2",
    // UI elements
    border: isDark ? "#333333" : designSystem.colors.neutral[100],
    borderLight: isDark ? "#2D2D2D" : "#E5E7EB",
    divider: isDark ? "#333333" : "#E0E0E0",
    card: theme.colors.surface,
    headerBg: theme.colors.primary,
    inputBorder: isDark ? "#444444" : "lightgray",
    inputText: isDark ? "#E0E0E0" : "gray",
    inputBg: isDark ? "#2D2D2D" : "#F5F5F5",
    shadow: isDark ? "#000000" : designSystem.colors.primary[500],
    shadowBlack: "#000000",
    overlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.5)",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
    // Quick action / icon backgrounds
    iconBackground: isDark ? "#2D2D2D" : designSystem.colors.neutral[50],
    iconColor: isDark ? "#CCCCCC" : designSystem.colors.neutral[500],
    // Disabled
    disabled: isDark ? "#555555" : designSystem.colors.neutral[500],
    disabledBg: isDark ? "#333333" : "#E0E0E0",
    // Common explicit colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent"
  };
};
