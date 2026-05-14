/**
 * Singleton axios client with:
 *   - Bearer auth injection
 *   - Pre-emptive refresh when access token within 60s of expiry
 *   - Reactive refresh on 401 with single-flight queue
 *   - Standard error shape (`ApiError`)
 *   - Per-request `x-request-id` for log correlation
 *   - Configurable timeout from env
 */
import { env } from '@/src/config/env';
import { tokenStorage, type StoredTokens } from '@/src/services/auth/token-storage';
import type { ApiEnvelope, ApiError, AuthTokens, RefreshTokenResponse } from '@/src/types/api';
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/* ────────────────────────── Refresh queue ────────────────────────── */

let refreshInFlight: Promise<AuthTokens> | null = null;
let onAuthFailedCb: (() => void) | null = null;

export function onAuthFailed(cb: () => void): void {
  onAuthFailedCb = cb;
}

async function performRefresh(refreshToken: string, client: AxiosInstance): Promise<AuthTokens> {
  // Use a bare axios call (no interceptors) to avoid loops.
  const { data } = await axios.post<ApiEnvelope<RefreshTokenResponse>>(
    `${env.apiBaseUrl}/auth/refresh`,
    { refreshToken },
    { timeout: env.apiTimeoutMs, headers: { 'content-type': 'application/json' } },
  );
  await tokenStorage.save(data.data.tokens);
  return data.data.tokens;
}

async function ensureFreshToken(client: AxiosInstance): Promise<StoredTokens | null> {
  const stored = await tokenStorage.load();
  if (!stored) return null;

  if (tokenStorage.refreshIsExpired(stored)) {
    await tokenStorage.clear();
    onAuthFailedCb?.();
    return null;
  }

  if (!tokenStorage.accessIsExpiring(stored)) return stored;

  if (!refreshInFlight) {
    refreshInFlight = performRefresh(stored.refreshToken, client).finally(() => {
      refreshInFlight = null;
    });
  }
  await refreshInFlight;
  return tokenStorage.load();
}

/* ────────────────────────── Client factory ────────────────────────── */

function makeClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeoutMs,
    headers: { 'content-type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const tokens = await ensureFreshToken(client);
    if (tokens) {
      config.headers.set('authorization', `Bearer ${tokens.accessToken}`);
    }
    if (env.surveySyncApiKey) {
      config.headers.set('x-api-key', env.surveySyncApiKey);
    }
    config.headers.set('x-request-id', genRequestId());
    config.headers.set('x-app-version', env.appVersion);
    config.headers.set('x-build', env.buildNumber);
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiEnvelope<unknown> | { error: ApiError }>) => {
      const original = error.config as RetriableConfig | undefined;
      const status = error.response?.status;

      // Single 401 retry: try refresh and replay the request once.
      if (status === 401 && original && !original._retried) {
        original._retried = true;
        const stored = await tokenStorage.load();
        if (stored && !tokenStorage.refreshIsExpired(stored)) {
          try {
            if (!refreshInFlight) {
              refreshInFlight = performRefresh(stored.refreshToken, client).finally(() => {
                refreshInFlight = null;
              });
            }
            await refreshInFlight;
            const fresh = await tokenStorage.load();
            if (fresh) {
              original.headers.set('authorization', `Bearer ${fresh.accessToken}`);
              return client.request(original);
            }
          } catch {
            await tokenStorage.clear();
            onAuthFailedCb?.();
          }
        } else {
          await tokenStorage.clear();
          onAuthFailedCb?.();
        }
      }

      return Promise.reject(normaliseError(error));
    },
  );

  return client;
}

/* ────────────────────────── Error normalisation ────────────────────────── */

export class HttpError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;
  isNetwork: boolean;
  isTimeout: boolean;

  constructor(payload: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, string[]>;
    isNetwork?: boolean;
    isTimeout?: boolean;
  }) {
    super(payload.message);
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.isNetwork = payload.isNetwork ?? false;
    this.isTimeout = payload.isTimeout ?? false;
  }
}

function normaliseError(error: AxiosError<unknown>): HttpError {
  if (error.code === 'ECONNABORTED') {
    return new HttpError({ status: 0, code: 'TIMEOUT', message: 'Request timed out', isTimeout: true });
  }
  if (error.message === 'Network Error') {
    return new HttpError({ status: 0, code: 'NETWORK', message: 'No internet connection', isNetwork: true });
  }
  const status = error.response?.status ?? 0;
  const payload = error.response?.data as { error?: ApiError } | undefined;
  return new HttpError({
    status,
    code: payload?.error?.code ?? 'UNKNOWN',
    message: payload?.error?.message ?? error.message ?? 'Unknown error',
    details: payload?.error?.details,
  });
}

/* ────────────────────────── Helpers ────────────────────────── */

function genRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const apiClient: AxiosInstance = makeClient();

/** Strongly-typed helpers around the envelope. */
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.get<ApiEnvelope<T>>(url, config);
    return res.data.data;
  },
  post: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.post<ApiEnvelope<T>>(url, body, config);
    return res.data.data;
  },
  put: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.put<ApiEnvelope<T>>(url, body, config);
    return res.data.data;
  },
  patch: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.patch<ApiEnvelope<T>>(url, body, config);
    return res.data.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.delete<ApiEnvelope<T>>(url, config);
    return res.data.data;
  },
};
