import { api } from '@/src/services/api/client';
import { tokenStorage } from '@/src/services/auth/token-storage';
import type { AuthUserDto, LoginRequest, LoginResponse } from '@/src/types/api';
import * as Application from 'expo-application';

export const authService = {
  async login(email: string, password: string): Promise<{ user: AuthUserDto }> {
    const deviceId = await getDeviceId();
    const body: LoginRequest = { email: email.trim().toLowerCase(), password, deviceId };
    const res = await api.post<LoginResponse, LoginRequest>('/auth/login', body);
    await tokenStorage.save(res.tokens);
    return { user: res.user };
  },

  async me(): Promise<AuthUserDto> {
    return api.get<AuthUserDto>('/auth/me');
  },

  async logout(): Promise<void> {
    // Fire-and-forget; tokens are cleared regardless of server response.
    try {
      const deviceId = await getDeviceId();
      await api.post('/auth/logout', undefined, {
        headers: { 'x-device-id': deviceId },
      });
    } catch {
      /* ignore; offline logout is fine */
    } finally {
      await tokenStorage.clear();
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const stored = await tokenStorage.load();
    if (!stored) return false;
    return !tokenStorage.refreshIsExpired(stored);
  },
};

async function getDeviceId(): Promise<string> {
  try {
    return Application.getAndroidId() ?? (await Application.getIosIdForVendorAsync()) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
