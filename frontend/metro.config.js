const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add regex to blockList to exclude hidden AppleDouble metadata files (._*)
config.resolver.blockList = [
  /.*\/\._.*/,
];

module.exports = config;
