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

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: designSystem.spacing.xl,
    paddingHorizontal: designSystem.spacing.lg
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },

  // Card styles
  cardSm: {
    backgroundColor: "#FFFFFF",
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing.md,
    ...designSystem.shadows.sm
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing.md,
    marginHorizontal: designSystem.spacing.md,
    marginVertical: designSystem.spacing.sm,
    ...designSystem.shadows.md
  },

  cardLg: {
    backgroundColor: "#FFFFFF",
    borderRadius: designSystem.borderRadius.xl,
    padding: designSystem.spacing.md,
    ...designSystem.shadows.lg
  },

  cardFlush: {
    backgroundColor: "#FFFFFF",
    borderRadius: designSystem.borderRadius.lg,
    ...designSystem.shadows.md,
    overflow: "hidden" as const
  },

  // Text styles
  titleText: { ...designSystem.typography.h2 },

  bodyText: { ...designSystem.typography.body },

  captionText: { ...designSystem.typography.caption },

  labelText: { ...designSystem.typography.label },

  sectionTitle: {
    ...designSystem.typography.h2,
    marginBottom: designSystem.spacing.md
  },

  errorText: { ...designSystem.typography.body },

  emptyStateText: {
    ...designSystem.typography.body,
    textAlign: "center"
  },

  textCenter: { textAlign: "center" },

  // Row layouts
  row: {
    flexDirection: "row",
    alignItems: "center"
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },

  columnCenter: {
    justifyContent: "center",
    alignItems: "center"
  },

  // Media
  fillImage: {
    width: "100%",
    height: "100%"
  },

  aspectRatio16x9: {
    aspectRatio: 16 / 9,
    width: "100%"
  },

  // Overlays & positioning
  overlayDark: { backgroundColor: "rgba(0,0,0,0.7)" },

  badge: {
    borderRadius: designSystem.borderRadius.md,
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs
  },

  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  absoluteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },

  // Action buttons
  circularButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center"
  },

  circularButtonLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center"
  }
});
