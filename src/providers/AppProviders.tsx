import { bindQueryClientToAppLifecycle, queryClient } from '@/src/lib/query-client';
import { useAuthStore } from '@/src/stores/auth';
import { registerBackgroundSync, unregisterBackgroundSync } from '@/src/sync/background-task';
import { syncEngine } from '@/src/sync/sync-engine';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

/** React Query + sync lifecycle (foreground sync when signed in). */
export function AppProviders({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => bindQueryClientToAppLifecycle(), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      void unregisterBackgroundSync();
      return;
    }
    if (!__DEV__) {
      void registerBackgroundSync();
    }
    void syncEngine.run();
  }, [hydrated, user?.id]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
