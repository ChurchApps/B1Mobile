export class Constants {
  static Colors = {
    // Primary Brand Colors from Style Guide
    app_color: "#1565C0", // Primary Blue (was #1C75BC)
    app_color_light: "#568BDA", // Light Blue from style guide
    bright_blue: "#2196F3", // Bright Blue for icons/highlights

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
    info_cyan: "#1C9BA0", // Info Cyan - new

    // Legacy colors (to be phased out)
    button_bg: "#2196F3", // Updated to Bright Blue
    button_dark_green: "#77CC01",
    Dark_Gray: "#9E9E9E", // Updated to Medium Gray
    Light_Green: "#AFE1AF",
    Dark_Green: "#2e7d32",
    Light_Red: "#ffdddd",
    Black_color: "#000000",
    Orange_color: "#ed6c02",
    Active_TabColor: "#1565C0" // Updated to Primary Blue
  };

  static Fonts = {
    RobotoLight: "Roboto-Light",
    RobotoBold: "Roboto-Bold",
    RobotoBlack: "Roboto-Black",
    RobotoMedium: "Roboto-Medium",
    RobotoRegular: "Roboto-Regular"
  };

  // Spacing based on 8px grid system from Style Guide
  static Spacing = {
    xs: 4, // Extra small
    sm: 8, // Small (base unit)
    md: 16, // Medium
    lg: 24, // Large
    xl: 32, // Extra large
    xxl: 48 // Extra extra large
  };

  // Typography sizes from Style Guide
  static FontSizes = {
    h1: 24, // Page titles and main headings
    h2: 20, // Section headings
    h3: 18, // Subsection headings
    body: 16, // Standard body text
    small: 14, // Secondary text and captions
    smaller: 12 // Fine print and metadata
  };

  // Component dimensions from Style Guide
  static Dimensions = {
    headerHeight: 56,
    drawerWidth: 280,
    drawerHeaderHeight: 150,
    touchTargetMin: 44,
    touchTargetPreferred: 48,
    buttonHeight: 48,
    inputHeight: 48,
    listItemHeight: 48,
    borderRadius: 8,
    borderRadiusLarge: 12
  };

  static Images = {
    splash_screen: require("../assets/images/splash.png"),
    ic_menu: require("../assets/images/ic_menu.png"),
    ic_user: require("../assets/images/ic_user.png"),
    ic_bible: require("../assets/images/ic_bible.png"),
    ic_preferences: require("../assets/images/ic_preferences.png"),
    ic_home: require("../assets/images/ic_home.png"),
    ic_live_stream: require("../assets/images/ic_live_stream.png"),
    ic_checkin: require("../assets/images/ic_checkin.png"),
    ic_give: require("../assets/images/ic_give.png"),
    ic_groups: require("../assets/images/ic_groups.png"),
    ic_getintouch: require("../assets/images/ic_getintouch.png"),
    ic_search: require("../assets/images/ic_search.png"),
    logoBlue: require("../assets/images/logoBlue.png"),
    logoWhite: require("../assets/images/logoWhite.png"),
    ic_church: require("../assets/images/ic_church.png"),
    ic_member: require("../assets/images/ic_member.png"),
    dash_bell: require("../assets/images/dash_bell.png")
  };
}
