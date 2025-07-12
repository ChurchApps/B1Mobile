import { StyleSheet } from "react-native";
import { designSystem } from "./designSystem";

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },

  containerWithPadding: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: designSystem.spacing.md
  },

  // Card styles
  card: {
    backgroundColor: "#ffffff",
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
