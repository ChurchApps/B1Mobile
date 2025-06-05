import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from "react-native-paper";
import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

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

// Custom spacing and dimensions
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const dimensions = {
  screenWidth: width,
  screenHeight: height,
  wp: (percentage: number) => (width * percentage) / 100,
  hp: (percentage: number) => (height * percentage) / 100
};

// Custom component styles that can be reused
export const componentStyles = {
  surface: {
    borderRadius: 8,
    padding: spacing.md,
    margin: spacing.md
  },
  card: {
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md
  },
  avatar: {
    size: {
      small: 40,
      medium: 48,
      large: 64
    }
  },
  image: {
    groupPhoto: {
      width: "100%" as const,
      height: 200,
      borderRadius: 8,
      marginBottom: spacing.md
    },
    profilePhoto: {
      width: 120,
      height: 120,
      borderRadius: 60
    }
  },
  input: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md
  },
  button: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md
  },
  list: {
    item: {
      padding: spacing.md,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.md,
      borderRadius: 8
    }
  },
  calendar: {
    header: {
      marginBottom: spacing.md
    },
    day: {
      borderRadius: 8
    }
  }
};

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
    spacing,
    dimensions,
    componentStyles
  };
};
