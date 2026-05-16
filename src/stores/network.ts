import { useAuthStore } from '@/src/stores/auth';
import { syncEngine } from '@/src/sync/sync-engine';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';

interface NetState {
  online: boolean;
  manualOffline: boolean;
  lastSyncAt: string;
  setOnline: (online: boolean) => void;
  toggleManualOffline: () => void;
  setLastSync: (iso: string) => void;
}

export const useNetworkStore = create<NetState>((set) => ({
  online: true,
  manualOffline: false,
  lastSyncAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  setOnline: (online) => set({ online }),
  toggleManualOffline: () => set((s) => ({ manualOffline: !s.manualOffline })),
  setLastSync: (iso) => set({ lastSyncAt: iso }),
}));

/** Effective online state respects manual offline toggle */
export function useIsOnline(): boolean {
  const online = useNetworkStore((s) => s.online);
  const manualOffline = useNetworkStore((s) => s.manualOffline);
  return online && !manualOffline;
}

/** Subscribe to NetInfo and pipe into store. Mount once in root layout. */
export function useNetworkSubscriber(): void {
  const setOnline = useNetworkStore((s) => s.setOnline);
  const wasOnline = useRef(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
      setOnline(online);
      if (online && !wasOnline.current && useAuthStore.getState().user) {
        void syncEngine.run();
      }
      wasOnline.current = online;
    });
    return () => unsub();
  }, [setOnline]);
}
