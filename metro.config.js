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
