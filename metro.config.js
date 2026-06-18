const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /node_modules\/.*\/android\/build\/.*/,
  /node_modules\/.*\/ios\/build\/.*/,
  /node_modules\/.*\/\.gradle\/.*/,
  /node_modules\/.*\/build\/intermediates\/.*/,
  /node_modules\/.*\/build\/generated\/.*/,
  /node_modules\/.*\/build\/classes\/.*/,
  /node_modules\/.*\/build\/tmp\/.*/,
  /android\/build\/.*/,
  /android\/\.gradle\/.*/,
  /android\/app\/build\/.*/,
];

config.watchFolders = [__dirname];

module.exports = config;
