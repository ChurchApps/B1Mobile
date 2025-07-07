const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

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

module.exports = config;
