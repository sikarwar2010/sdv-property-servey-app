import Constants from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

/** WatermelonDB native bridge (legacy NativeModules or New Architecture TurboModule). */
function getWatermelonBridge(): Record<string, unknown> | null {
  const legacy = NativeModules.WMDatabaseBridge as Record<string, unknown> | undefined;
  if (legacy) return legacy;

  try {
    const turbo = TurboModuleRegistry.get('WMDatabaseBridge') as Record<string, unknown> | null;
    if (turbo) return turbo;
  } catch {
    // TurboModule not registered in this build
  }

  return null;
}

/** True when the host app includes WatermelonDB native code (custom dev build), not Expo Go. */
export function isWatermelonNativeAvailable(): boolean {
  if (getWatermelonBridge()) return true;
  const g = globalThis as { nativeWatermelonCreateAdapter?: unknown };
  return typeof g.nativeWatermelonCreateAdapter === 'function';
}

/** Expo Go only — dev clients built with expo-dev-client report `appOwnership: null`. */
function isExpoGo(): boolean {
  if (Constants.appOwnership === 'expo') return true;
  if (NativeModules.EXDevLauncher) return false;
  return false;
}

export function assertWatermelonNative(): void {
  if (isWatermelonNativeAvailable()) return;

  const hint = isExpoGo()
    ? [
        'This app is running in Expo Go, which does not include WatermelonDB.',
        'Close Expo Go and open your development build instead, then start Metro:',
        '  bun run dev:android',
        'Or: bun run start — then open the "sdv-property-survey-apps" app on the device (not Expo Go).',
      ].join('\n')
    : [
        'WatermelonDB native code is missing from this build.',
        'Regenerate native projects and reinstall:',
        '  bun run prebuild:android',
        '  bun run dev:android',
      ].join('\n');

  throw new Error(`[database] ${hint}`);
}

export function getNativePlatformLabel(): string {
  return Platform.OS;
}
