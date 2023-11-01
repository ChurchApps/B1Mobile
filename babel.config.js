module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ["module:react-native-dotenv", {
      moduleName: "@env",
      path: ".env",
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true
    },
    ],
    ["module-resolver" , {
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      root:["."],
      alias:{
        "@churchapps/mobilehelper": "./src/churchapps/mobilehelper",
      }
    }],
    ["react-native-reanimated/plugin"]
  ]
};
