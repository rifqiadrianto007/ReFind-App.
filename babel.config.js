module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Preset untuk Expo
    plugins: ['react-native-reanimated/plugin'], // Plugin untuk Reanimated
  };
};
