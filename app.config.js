module.exports = {
  expo: {
    name: "B1Mobile",
    slug: "B1Mobile",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "church.b1.mobile",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    runtimeVersion: "2.0.0",
    extra: {
      ATTENDANCE_API: process.env.ATTENDANCE_API || "https://attendanceapi.churchapps.org",
      B1_WEB_ROOT: process.env.B1_WEB_ROOT || "https://{subdomain}.b1.church",
      CONTENT_API: process.env.CONTENT_API || "https://contentapi.churchapps.org",
      CONTENT_ROOT: process.env.CONTENT_ROOT || "https://content.churchapps.org",
      DOING_API: process.env.DOING_API || "https://doingapi.churchapps.org",
      GIVING_API: process.env.GIVING_API || "https://givingapi.churchapps.org",
      LESSONS_API: process.env.LESSONS_API || "https://api.lessons.church",
      LESSONS_ROOT: process.env.LESSONS_ROOT || "https://lessons.church",
      MEMBERSHIP_API: process.env.MEMBERSHIP_API || "https://membershipapi.churchapps.org",
      MESSAGING_API: process.env.MESSAGING_API || "https://messagingapi.churchapps.org",
      STREAMING_LIVE_ROOT: process.env.STREAMING_LIVE_ROOT || "https://{subdomain}.streaminglive.church",
      STAGE: process.env.STAGE || "prod",
      eas: {
        projectId: "f72e5911-b8d5-467c-ad9e-423c180e9938"
      }
    }
  }
};
