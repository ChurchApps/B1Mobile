const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const POST_INSTALL_PATCH = `
    # withFirebaseStaticFramework: relax modular-header check for RN/Firebase pods
    installer.pods_project.targets.each do |target|
      if ['React-Core', 'React', 'React-RCTBridging', 'RNFBApp'].include?(target.name)
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'
          bc.build_settings['DEFINES_MODULE'] = 'YES'
        end
      end
    end
`;

module.exports = function withFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf-8");
      let modified = false;

      // 1. Make Firebase pods build as static frameworks (per @react-native-firebase docs)
      if (!contents.includes("$RNFirebaseAsStaticFramework")) {
        contents = "$RNFirebaseAsStaticFramework = true\n\n" + contents;
        modified = true;
      }

      // 2. Force modular headers globally so React-Core headers can be included
      //    from framework modules
      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          /(prepare_react_native_project!\s*\n)/,
          "use_modular_headers!\n\n$1"
        );
        modified = true;
      }

      // 3. In post_install, disable the non-modular-include warning-as-error
      //    for React-Core and RNFBApp targets
      if (!contents.includes("withFirebaseStaticFramework: relax modular-header check")) {
        contents = contents.replace(
          /(react_native_post_install\([\s\S]*?\)\s*\n)/,
          "$1" + POST_INSTALL_PATCH
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(podfilePath, contents);
        console.log("[withFirebaseStaticFramework] Podfile patched");
      } else {
        console.log("[withFirebaseStaticFramework] Podfile already patched");
      }
      return config;
    },
  ]);
};
