import { useEffect } from 'react';
import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

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
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });
    return () => unsub();
  }, [setOnline]);
}
