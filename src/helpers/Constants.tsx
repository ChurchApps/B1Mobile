export class Constants {
  static Colors = {
    // Primary Brand Colors from Style Guide
    app_color: "#0D47A1", // Darker Primary Blue (was #0D47A1)
    app_color_light: "#568BDA", // Light Blue from style guide

    // Neutral Colors from Style Guide
    gray_bg: "#F6F6F8", // Background (Ghost White) - already correct
    white_color: "#FFFFFF", // Card Background
    dark_gray: "#3c3c3c", // Primary text color
    medium_gray: "#9E9E9E", // Secondary text and icons
    light_gray: "lightgray", // Borders and dividers

    // Status Colors from Style Guide
    button_green: "#70DC87", // Success Green - already correct
    button_yellow: "#FEAA24", // Warning Yellow (was #FAC108)
    button_red: "#B0120C", // Error Red - already correct

    // Legacy colors (to be phased out)
    button_bg: "#2196F3", // Updated to Bright Blue
    button_dark_green: "#77CC01",
    Dark_Gray: "#9E9E9E", // Updated to Medium Gray
    Active_TabColor: "#0D47A1" // Updated to Primary Blue
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
