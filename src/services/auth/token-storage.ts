/**
 * Secure token storage backed by expo-secure-store.
 * Stores access + refresh tokens with their expiry timestamps so the
 * API client can pre-emptively refresh before hitting a 401.
 */
import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '@/src/types/api';

const ACCESS_KEY = 'auth.access';
const REFRESH_KEY = 'auth.refresh';
const ACCESS_EXP_KEY = 'auth.access.exp';
const REFRESH_EXP_KEY = 'auth.refresh.exp';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number; // ms epoch
  refreshExpiresAt: number;
}

export const tokenStorage = {
  async save(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken, OPTIONS),
      SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken, OPTIONS),
      SecureStore.setItemAsync(ACCESS_EXP_KEY, String(new Date(tokens.accessExpiresAt).getTime()), OPTIONS),
      SecureStore.setItemAsync(REFRESH_EXP_KEY, String(new Date(tokens.refreshExpiresAt).getTime()), OPTIONS),
    ]);
  },

  async load(): Promise<StoredTokens | null> {
    const [access, refresh, accessExp, refreshExp] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY, OPTIONS),
      SecureStore.getItemAsync(REFRESH_KEY, OPTIONS),
      SecureStore.getItemAsync(ACCESS_EXP_KEY, OPTIONS),
      SecureStore.getItemAsync(REFRESH_EXP_KEY, OPTIONS),
    ]);
    if (!access || !refresh || !accessExp || !refreshExp) return null;
    return {
      accessToken: access,
      refreshToken: refresh,
      accessExpiresAt: Number(accessExp),
      refreshExpiresAt: Number(refreshExp),
    };
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY, OPTIONS),
      SecureStore.deleteItemAsync(REFRESH_KEY, OPTIONS),
      SecureStore.deleteItemAsync(ACCESS_EXP_KEY, OPTIONS),
      SecureStore.deleteItemAsync(REFRESH_EXP_KEY, OPTIONS),
    ]);
  },

  /** True when the access token has < 60 s remaining. */
  accessIsExpiring(t: StoredTokens, skewMs = 60_000): boolean {
    return Date.now() >= t.accessExpiresAt - skewMs;
  },

  refreshIsExpired(t: StoredTokens): boolean {
    return Date.now() >= t.refreshExpiresAt;
  },
};
