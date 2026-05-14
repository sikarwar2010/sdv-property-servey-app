/**
 * Centralised environment configuration.
 * Reads from `extra` in app.json / EAS secrets. Falls back to development defaults.
 */
import Constants from 'expo-constants';

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

export const env: AppEnv = {
  apiBaseUrl: (extra.apiBaseUrl as string) ?? 'https://api.sdvedutech.in/v1',
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
