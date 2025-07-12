const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Performance optimizations for bundle splitting
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  assert: path.resolve(__dirname, 'node_modules/assert/'),
  util: path.resolve(__dirname, 'node_modules/util/'),
};

config.resolver.platforms = [
  'native',
  'android',
  'ios',
  'web'
];

// Add path aliases for better imports
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@helpers': path.resolve(__dirname, 'src/helpers'),
  '@stores': path.resolve(__dirname, 'src/stores'),
  '@theme': path.resolve(__dirname, 'src/theme'),
  '@config': path.resolve(__dirname, 'src/config'),
  // Enable tree shaking for vector icons
  '@expo/vector-icons/AntDesign': '@expo/vector-icons/build/AntDesign',
  '@expo/vector-icons/Entypo': '@expo/vector-icons/build/Entypo',
  '@expo/vector-icons/EvilIcons': '@expo/vector-icons/build/EvilIcons',
  '@expo/vector-icons/Feather': '@expo/vector-icons/build/Feather',
  '@expo/vector-icons/FontAwesome': '@expo/vector-icons/build/FontAwesome',
  '@expo/vector-icons/FontAwesome5': '@expo/vector-icons/build/FontAwesome5',
  '@expo/vector-icons/FontAwesome6': '@expo/vector-icons/build/FontAwesome6',
  '@expo/vector-icons/Fontisto': '@expo/vector-icons/build/Fontisto',
  '@expo/vector-icons/Foundation': '@expo/vector-icons/build/Foundation',
  '@expo/vector-icons/Ionicons': '@expo/vector-icons/build/Ionicons',
  '@expo/vector-icons/MaterialCommunityIcons': '@expo/vector-icons/build/MaterialCommunityIcons',
  '@expo/vector-icons/MaterialIcons': '@expo/vector-icons/build/MaterialIcons',
  '@expo/vector-icons/Octicons': '@expo/vector-icons/build/Octicons',
  '@expo/vector-icons/SimpleLineIcons': '@expo/vector-icons/build/SimpleLineIcons',
  '@expo/vector-icons/Zocial': '@expo/vector-icons/build/Zocial',
};

// Optimize transformer for better performance
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  },
};

// Reduce file system lookups for better performance
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'app'),
];

module.exports = config;
