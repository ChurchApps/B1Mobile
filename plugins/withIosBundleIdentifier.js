const { withInfoPlist, withXcodeProject } = require("@expo/config-plugins");

const BUNDLE_ID = "church.b1.mobile";

module.exports = function withIosBundleIdentifier(config) {
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key of Object.keys(configurations)) {
      const configuration = configurations[key];
      if (typeof configuration !== "object" || !configuration.buildSettings) continue;

      if (configuration.buildSettings.PRODUCT_NAME === "B1Mobile") {
        configuration.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = BUNDLE_ID;
      }
    }

    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleIdentifier = "$(PRODUCT_BUNDLE_IDENTIFIER)";
    return config;
  });

  return config;
};
