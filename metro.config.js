const { getDefaultConfig } = require("expo/metro-config");
module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    base32: require.resolve("base32.js")
  };
  return config;
})();