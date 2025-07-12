import { designSystem } from "../theme/designSystem";

export class Constants {
  static Colors = {
    // Primary Brand Colors from Design System
    app_color: designSystem.colors.primary[500], // Main brand color
    app_color_light: designSystem.colors.secondary[500], // Light Blue

    // Neutral Colors from Design System
    gray_bg: designSystem.colors.neutral[50], // Background
    white_color: "#FFFFFF", // Card Background
    dark_gray: designSystem.colors.neutral[900], // Primary text color
    medium_gray: designSystem.colors.neutral[500], // Secondary text and icons
    light_gray: designSystem.colors.neutral[100], // Borders and dividers

    // Status Colors from Design System
    button_green: designSystem.colors.success[500], // Success Green
    button_yellow: designSystem.colors.warning[500], // Warning Yellow
    button_red: designSystem.colors.error[500], // Error Red

    // Legacy colors (to be phased out)
    button_bg: "#2196F3", // Updated to Bright Blue
    button_dark_green: "#77CC01",
    Dark_Gray: designSystem.colors.neutral[500], // Updated to Medium Gray
    Active_TabColor: designSystem.colors.primary[500] // Updated to Primary Blue
  };

  static Fonts = {
    RobotoLight: "Roboto-Light",
    RobotoBold: "Roboto-Bold",
    RobotoMedium: "Roboto-Medium",
    RobotoRegular: "Roboto-Regular"
  };

  static Images = {
    ic_menu: require("../assets/images/ic_menu.png"),
    ic_user: require("../assets/images/ic_user.png"),
    ic_give: require("../assets/images/ic_give.png"),
    logoBlue: require("../assets/images/logoBlue.png"),
    logoWhite: require("../assets/images/logoWhite.png"),
    ic_church: require("../assets/images/ic_church.png"),
    ic_member: require("../assets/images/ic_member.png")
  };
}
