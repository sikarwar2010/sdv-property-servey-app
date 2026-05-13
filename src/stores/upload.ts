/**
 * Upload store — observable progress for in-flight photo uploads.
 *
 * The upload queue (`src/sync/upload-queue.ts`) writes here. UI components
 * subscribe to render per-photo progress bars and an overall queue indicator.
 */
import { create } from 'zustand';

interface UploadState {
  queueSize: number;
  completed: number;
  /** photoId → percent 0-100 */
  progressById: Record<string, number>;
}

interface UploadActions {
  setQueueSize: (size: number) => void;
  tickCompleted: () => void;
  setProgress: (photoId: string, percent: number) => void;
  clearProgress: (photoId: string) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState & UploadActions>((set) => ({
  queueSize: 0,
  completed: 0,
  progressById: {},

  setQueueSize: (queueSize) => set({ queueSize, completed: 0 }),
  tickCompleted: () => set((s) => ({ completed: s.completed + 1 })),
  setProgress: (photoId, percent) => set((s) => ({ progressById: { ...s.progressById, [photoId]: percent } })),
  clearProgress: (photoId) =>
    set((s) => {
      const next = { ...s.progressById };
      delete next[photoId];
      return { progressById: next };
    }),
  reset: () => set({ queueSize: 0, completed: 0, progressById: {} }),
}));

/** Selector — true when there's an in-flight upload. */
export const useIsUploading = (): boolean => useUploadStore((s) => s.queueSize > s.completed);
