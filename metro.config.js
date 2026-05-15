const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// WatermelonDB's Node sqlite adapter is native-only — stub on web so Metro does not fail.
const nativeOnlyModules = new Set(['better-sqlite3']);
const nativeOnlyPrefixes = [
  '@nozbe/watermelondb/adapters/sqlite/sqlite-node',
];

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (
      nativeOnlyModules.has(moduleName) ||
      nativeOnlyPrefixes.some((p) => moduleName.startsWith(p))
    ) {
      return { type: 'empty' };
    }
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
