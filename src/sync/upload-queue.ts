/**
 * Upload queue.
 *
 * Independent of the survey sync cycle so a slow photo doesn't hold up
 * survey metadata. Bounded concurrency (default 2) prevents network thrash.
 *
 * Public surface:
 *   uploadQueue.run()       — kick a pass (idempotent / coalesced)
 *   uploadQueue.observe()   — Zustand observable for UI progress
 */
import { env } from '@/src/config/env';
import type { StoredPhoto } from '@/src/database/local-types';
import { photoRepo } from '@/src/database/survey.repo';
import { uploadService } from '@/src/services/uploads/upload.service';
import { useUploadStore } from '@/src/stores/upload';

let inFlight: Promise<void> | null = null;

export const uploadQueue = {
  run(): Promise<void> {
    if (inFlight) return inFlight;
    inFlight = doRun().finally(() => {
      inFlight = null;
    });
    return inFlight;
  },
};

async function doRun(): Promise<void> {
  const store = useUploadStore.getState();
  const pending = await photoRepo.pendingUpload(50);
  if (pending.length === 0) return;
  store.setQueueSize(pending.length);

  let cursor = 0;
  const concurrency = env.uploadConcurrency;

  async function worker(): Promise<void> {
    while (cursor < pending.length) {
      const photo = pending[cursor++];
      if (!photo) return;
      await uploadOne(photo);
      store.tickCompleted();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, pending.length) }, () => worker());
  await Promise.all(workers);
  store.reset();
}

async function uploadOne(photo: StoredPhoto): Promise<void> {
  try {
    await photoRepo.markUploading(photo.surveyId, photo.id);
    const result = await uploadService.uploadPhoto(photo.localUri, {
      surveyId: photo.surveyId,
      slot: photo.slot,
      capturedAt: photo.capturedAt,
      onProgress: (loaded, total) => {
        useUploadStore.getState().setProgress(photo.id, Math.round((loaded / total) * 100));
      },
    });
    await photoRepo.markDone(photo.surveyId, photo.id, result.serverKey);
    useUploadStore.getState().clearProgress(photo.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'upload_failed';
    await photoRepo.markFailed(photo.surveyId, photo.id, message);
    useUploadStore.getState().clearProgress(photo.id);
  }
}
