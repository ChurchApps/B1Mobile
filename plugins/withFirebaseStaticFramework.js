const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf-8");
      let modified = false;

      if (!contents.includes("$RNFirebaseAsStaticFramework")) {
        contents = "$RNFirebaseAsStaticFramework = true\n\n" + contents;
        modified = true;
      }

      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          /(target ['"]B1Mobile['"] do\s*\n)/,
          "$1  use_modular_headers!\n"
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(podfilePath, contents);
        console.log("[withFirebaseStaticFramework] Podfile patched");
      } else {
        console.log("[withFirebaseStaticFramework] Podfile already patched, skipping");
      }
      return config;
    },
  ]);
};
