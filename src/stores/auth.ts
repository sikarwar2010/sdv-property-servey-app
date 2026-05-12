import { currentUser as mockUser } from '@/src/mocks/surveys';
import type { AuthUser } from '@/src/types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const STORAGE_KEYS = {
  user: 'auth-user',
  accessToken: 'auth-access-token',
  refreshToken: 'auth-refresh-token',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  isLoading: false,
  errorMessage: null,

  hydrate: async () => {
    try {
      const [userJson, access, refresh] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.user),
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
      ]);
      if (userJson && access) {
        set({
          user: JSON.parse(userJson) as AuthUser,
          accessToken: access,
          refreshToken: refresh,
        });
      }
    } catch {
      // ignore
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, errorMessage: null });
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 800));

    if (username.trim() === '' || password.trim() === '') {
      set({ isLoading: false, errorMessage: 'Please enter both username and password.' });
      return false;
    }

    const user = { ...mockUser, username };
    const accessToken = 'mock-jwt-access-token';
    const refreshToken = 'mock-jwt-refresh-token';

    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(user)),
      SecureStore.setItemAsync(STORAGE_KEYS.accessToken, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken),
    ]);

    set({ user, accessToken, refreshToken, isLoading: false, errorMessage: null });
    return true;
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.user),
      SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
