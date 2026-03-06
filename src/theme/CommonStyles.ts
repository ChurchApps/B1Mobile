import { StyleSheet } from "react-native";
import { designSystem } from "./designSystem";

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.neutral[50]
  },

  containerWithPadding: {
    flex: 1,
    backgroundColor: designSystem.colors.neutral[50],
    padding: designSystem.spacing.md
  },

  // Card styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing.md,
    marginHorizontal: designSystem.spacing.md,
    marginVertical: designSystem.spacing.sm,
    ...designSystem.shadows.md
  },

  // Text styles

  // Row layouts
  row: {
    flexDirection: "row",
    alignItems: "center"
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
