module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // expo-router must run before reanimated (reanimated plugin must be last)
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
