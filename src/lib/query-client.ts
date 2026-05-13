/**
 * Global React Query client.
 *
 * Defaults are tuned for a field survey app:
 *   - Aggressive caching (data rarely changes outside our control)
 *   - Smart retry that respects HttpError.status (no retries on 4xx)
 *   - Network-paused mutations so they replay on reconnect
 *   - Long gcTime so caches survive backgrounding
 */
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { HttpError } from '@/src/services/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry 4xx (client errors), do retry 5xx and network
        if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false, // RN doesn't have window focus
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0, // mutations are explicit; sync engine owns retries
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Bridge React Query's focusManager + onlineManager to React Native.
 * Call once from the root layout.
 */
export function bindQueryClientToAppLifecycle(): () => void {
  // Focus: refetch on foreground.
  const onAppStateChange = (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  };
  const sub = AppState.addEventListener('change', onAppStateChange);

  // Network: pause when offline.
  const unsubNet = NetInfo.addEventListener((state) => {
    onlineManager.setOnline(Boolean(state.isConnected && state.isInternetReachable));
  });

  return () => {
    sub.remove();
    unsubNet();
  };
}
