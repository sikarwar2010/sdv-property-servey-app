/**
 * Sync store — UI-facing observable state for the sync engine.
 *
 * The engine (`src/sync/sync-engine.ts`) mutates this; React components
 * subscribe via `useSyncStore`. Keeps engine logic free of UI concerns.
 */
import { create } from 'zustand';

export type CycleState = 'idle' | 'running' | 'failed';

interface SyncState {
  cycleState: CycleState;
  lastSyncAt: string | null; // ISO; null = never synced
  pendingCount: number;
  failedCount: number;
  lastError: string | null;
}

interface SyncActions {
  setCycleState: (state: CycleState, error?: string) => void;
  setLastSyncAt: (iso: string | null) => void;
  setCounts: (pending: number, failed: number) => void;
  clearError: () => void;
}

export const useSyncStore = create<SyncState & SyncActions>((set) => ({
  cycleState: 'idle',
  lastSyncAt: null,
  pendingCount: 0,
  failedCount: 0,
  lastError: null,

  setCycleState: (cycleState, error) =>
    set((prev) => ({
      cycleState,
      lastError: cycleState === 'failed' ? (error ?? prev.lastError) : null,
    })),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setCounts: (pendingCount, failedCount) => set({ pendingCount, failedCount }),
  clearError: () => set({ lastError: null }),
}));

/** Convenience selector — components only re-render when this slice changes. */
export const useIsSyncing = (): boolean => useSyncStore((s) => s.cycleState === 'running');
