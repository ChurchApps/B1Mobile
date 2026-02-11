/**
 * Consolidated Design System
 * Single source of truth for colors, typography, and spacing
 * Implements recommendations from lines 25-59 of ui-ux-review.md
 */

export const designSystem = {
  colors: {
    primary: {
      50: "#E3F2FD",
      500: "#0D47A1", // Main brand color
      900: "#0D47A1"
    },
    neutral: {
      50: "#F6F6F8",
      100: "#F0F0F0",
      500: "#9E9E9E",
      900: "#3c3c3c"
    },
    // Semantic colors
    success: { 500: "#70DC87" },
    warning: { 500: "#FEAA24" },
    error: { 500: "#B0120C" },
    // Additional brand colors
    secondary: { 500: "#568BDA" } // Light blue
  },
  typography: {
    h1: { fontSize: 24, fontWeight: "700" as const },
    h2: { fontSize: 20, fontWeight: "600" as const },
    body: { fontSize: 16, fontWeight: "400" as const },
    // Additional typography variants for better hierarchy
    h3: { fontSize: 18, fontWeight: "600" as const },
    bodySmall: { fontSize: 14, fontWeight: "400" as const },
    caption: { fontSize: 12, fontWeight: "400" as const },
    label: { fontSize: 14, fontWeight: "500" as const }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  // Additional design tokens
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    }
  }
};

// Export individual systems for easier importing
export const { colors, typography, spacing, borderRadius, shadows } = designSystem;

// Helper functions for consistent usage
export const getSpacing = (size: keyof typeof spacing) => designSystem.spacing[size];
export const getColor = (category: keyof typeof colors, shade?: string | number) => {
  const colorCategory = designSystem.colors[category];
  if (typeof colorCategory === "object" && shade) {
    return (colorCategory as any)[shade];
  }
  if (typeof colorCategory === "object" && colorCategory[500]) {
    return (colorCategory as any)[500];
  }
  return colorCategory;
};
export const getTypography = (variant: keyof typeof typography) => designSystem.typography[variant];
export const getBorderRadius = (size: keyof typeof borderRadius) => designSystem.borderRadius[size];
export const getShadow = (size: keyof typeof shadows) => designSystem.shadows[size];
