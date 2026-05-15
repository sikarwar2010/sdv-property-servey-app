/**
 * Centralised environment configuration.
 * Reads from `extra` in app.json / EAS secrets. Falls back to development defaults.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface AppEnv {
  apiBaseUrl: string;
  /** Optional static key for Golang/Gin survey ingest (sent as `X-API-Key`). EAS secret / app.json `extra`. */
  surveySyncApiKey: string;
  apiTimeoutMs: number;
  syncBatchSize: number;
  uploadConcurrency: number;
  photoMaxKb: number;
  photoMaxDimension: number;
  appVersion: string;
  buildNumber: string;
  isProduction: boolean;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppEnv> & Record<string, unknown>;

/** Local Go API in development. */
function defaultDevApiBaseUrl(): string {
  // Android emulator → host loopback; iOS simulator → localhost.
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:8080/v1`;
}

/**
 * Production URL lives in app.json `extra.apiBaseUrl` (EAS builds).
 * In __DEV__ we always use the local API unless `extra.apiBaseUrlDev` is set
 * (use your LAN IP when testing on a physical phone).
 */
function resolveApiBaseUrl(): string {
  if (__DEV__) {
    const devOverride = (extra.apiBaseUrlDev as string | undefined)?.trim();
    if (devOverride) return devOverride.replace(/\/$/, '');
    return defaultDevApiBaseUrl();
  }
  return ((extra.apiBaseUrl as string) ?? 'https://api.sdvedutech.in/v1').replace(/\/$/, '');
}

export const env: AppEnv = {
  apiBaseUrl: resolveApiBaseUrl(),
  surveySyncApiKey: String(extra.surveySyncApiKey ?? ''),
  apiTimeoutMs: Number(extra.apiTimeoutMs ?? 25_000),
  syncBatchSize: Number(extra.syncBatchSize ?? 25),
  uploadConcurrency: Number(extra.uploadConcurrency ?? 2),
  photoMaxKb: Number(extra.photoMaxKb ?? 200),
  photoMaxDimension: Number(extra.photoMaxDimension ?? 1600),
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  buildNumber:
    (Constants.expoConfig?.ios?.buildNumber as string | undefined) ??
    String(Constants.expoConfig?.android?.versionCode ?? '1'),
  isProduction: !__DEV__,
};

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.info('[env] apiBaseUrl =', env.apiBaseUrl);
}
