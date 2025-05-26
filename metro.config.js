const {
  getDefaultConfig
} = require("expo/metro-config");

const config =
  getDefaultConfig(
    __dirname
  );

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
