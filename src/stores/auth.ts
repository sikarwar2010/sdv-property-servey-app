import { env } from '@/src/config/env';
import { HttpError, onAuthFailed } from '@/src/services/api/client';
import { authService } from '@/src/services/auth/auth.service';
import { tokenStorage } from '@/src/services/auth/token-storage';
import { bindAuthSessionReader } from '@/src/stores/auth-session';
import type { AuthUser } from '@/src/types';
import type { AuthUserDto } from '@/src/types/api';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
}

const USER_KEY = 'auth.user';

const USER_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function dtoToUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    districtName: dto.districtName,
    ulbCode: dto.ulbCode,
    ulbName: dto.ulbName,
    wardAssignments: dto.wardAssignments,
  };
}

function normalizeEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@sdvedutech.in`;
}

async function persistUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user), USER_STORE_OPTIONS);
}

async function loadCachedUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY, USER_STORE_OPTIONS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  isLoading: false,
  errorMessage: null,

  clearSession: async () => {
    await Promise.all([tokenStorage.clear(), SecureStore.deleteItemAsync(USER_KEY, USER_STORE_OPTIONS)]);
    set({ user: null, errorMessage: null });
  },

  hydrate: async () => {
    try {
      const tokens = await tokenStorage.load();
      if (!tokens || tokenStorage.refreshIsExpired(tokens)) {
        await get().clearSession();
        return;
      }

      const cached = await loadCachedUser();
      if (cached) {
        set({ user: cached });
        return;
      }

      const dto = await authService.me();
      const user = dtoToUser(dto);
      await persistUser(user);
      set({ user });
    } catch {
      await get().clearSession();
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, errorMessage: null });
    const normalized = normalizeEmail(email);

    if (!normalized || password.trim() === '') {
      set({
        isLoading: false,
        errorMessage: 'Please enter both email and password.',
      });
      return false;
    }

    try {
      const { user: dto } = await authService.login(normalized, password);
      const user = dtoToUser(dto);
      await persistUser(user);
      set({ user, isLoading: false, errorMessage: null });
      return true;
    } catch (err) {
      let message = 'Sign in failed. Check your connection and try again.';
      if (err instanceof HttpError) {
        if (err.isNetwork || err.isTimeout) {
          message = `Cannot reach API at ${env.apiBaseUrl}. Start the Go server and ensure the device can reach that URL (emulator: 10.0.2.2 for host localhost).`;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ isLoading: false, errorMessage: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      /* offline logout is fine */
    } finally {
      await get().clearSession();
    }
  },
}));

bindAuthSessionReader(() => useAuthStore.getState().user);

onAuthFailed(() => {
  void useAuthStore.getState().clearSession();
});
