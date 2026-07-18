const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
  'homehelp-mobile-ui': path.resolve(__dirname, '../../mobile-ui/src'),
};

module.exports = config;