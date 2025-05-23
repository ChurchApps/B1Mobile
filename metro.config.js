const {
  getDefaultConfig
} = require("expo/metro-config");

const config =
  getDefaultConfig(
    __dirname
  );

// Add Node.js polyfills
config.resolver.alias =
  {
    crypto:
      "react-native-crypto-js",
    stream:
      "readable-stream",
    buffer:
      "@craftzdog/react-native-buffer"
  };

// Ensure these modules are resolved
config.resolver.platforms =
  [
    "native",
    "android",
    "ios",
    "web"
  ];

module.exports =
  config;
