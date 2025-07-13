module.exports = {
  expo: {
    name: "B1Mobile",
    slug: "B1Mobile",
    version: "3.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "b1mobile", // For deep linking
    splash: {
      image: "./src/assets/images/logoWhite.png",
      resizeMode: "contain",
      backgroundColor: "#2196F3"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "church.b1.mobile",
      googleServicesFile: "./config/GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "B1 Church needs camera access to allow you to take photos for your profile and share with your church community.",
        NSPhotoLibraryUsageDescription: "B1 Church needs access to your photos to allow you to upload profile pictures and share images with your church community.",
        NSMicrophoneUsageDescription: "B1 Church needs microphone access to allow you to record audio messages and participate in church communications.",
        NSLocationWhenInUseUsageDescription: "B1 Church uses your location to help you find nearby church events and connect with local church members.",
        NSUserNotificationsUsageDescription: "B1 Church sends notifications to keep you updated about church events, messages, and important announcements.",
        LSApplicationQueriesSchemes: [
          "mailto",
          "tel",
          "sms"
        ]
      }
    },
    android: {
      package: "church.b1.mobile",
      googleServicesFile: "./config/google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      // Uncomment this if you want to be explicit about permissions
      /*
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION"
      ],
      */
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    runtimeVersion: "3.0.0",
    plugins: [
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
          sounds: [
            "./assets/sounds/notification.mp3"
          ]
        }
      ]
    ],
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
