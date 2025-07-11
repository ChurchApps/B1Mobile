import { StyleSheet } from "react-native";
import { Constants } from "../helpers";

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  
  containerWithPadding: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  
  // Card styles
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  cardNoPadding: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  // Text styles
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Constants.Colors.text_dark
  },
  
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: Constants.Colors.text_dark
  },
  
  subtitleText: {
    fontSize: 16,
    fontWeight: "500",
    color: Constants.Colors.text_gray
  },
  
  bodyText: {
    fontSize: 14,
    color: Constants.Colors.text_dark
  },
  
  captionText: {
    fontSize: 12,
    color: Constants.Colors.text_gray
  },
  
  errorText: {
    fontSize: 12,
    color: Constants.Colors.button_red,
    marginTop: 4
  },
  
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
  
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  
  // Spacing
  marginBottomSm: {
    marginBottom: 8
  },
  
  marginBottomMd: {
    marginBottom: 16
  },
  
  marginBottomLg: {
    marginBottom: 24
  },
  
  marginTopSm: {
    marginTop: 8
  },
  
  marginTopMd: {
    marginTop: 16
  },
  
  marginTopLg: {
    marginTop: 24
  },
  
  paddingSm: {
    padding: 8
  },
  
  paddingMd: {
    padding: 16
  },
  
  paddingLg: {
    padding: 24
  },
  
  // Common UI elements
  separator: {
    height: 1,
    backgroundColor: Constants.Colors.gray_bg,
    marginVertical: 16
  },
  
  divider: {
    height: 1,
    backgroundColor: Constants.Colors.gray_bg
  },
  
  // Form styles
  formContainer: {
    padding: 16
  },
  
  formSection: {
    marginBottom: 24
  },
  
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Constants.Colors.text_dark,
    marginBottom: 8
  },
  
  // Button group
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16
  },
  
  buttonGroupVertical: {
    marginTop: 16
  },
  
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  
  emptyStateText: {
    fontSize: 16,
    color: Constants.Colors.text_gray,
    textAlign: "center"
  },
  
  // List item
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Constants.Colors.gray_bg
  },
  
  // Badge
  badge: {
    backgroundColor: Constants.Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600"
  },
  
  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Constants.Colors.gray_bg,
    alignItems: "center",
    justifyContent: "center"
  },
  
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Constants.Colors.gray_bg,
    alignItems: "center",
    justifyContent: "center"
  },
  
  // Section header
  sectionHeader: {
    backgroundColor: Constants.Colors.gray_bg,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: Constants.Colors.text_gray,
    textTransform: "uppercase"
  }
});