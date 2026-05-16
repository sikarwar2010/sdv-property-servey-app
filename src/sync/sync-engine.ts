/**
 * Sync engine — owns the push → pull cycle (Go API).
 *
 * Triggers:
 *   1. Manual: Sync screen "Sync now" button
 *   2. Reconnect: NetInfo online transition
 *   3. Boot: AuthGate after hydration if authenticated
 *   4. Background: registerBackgroundSyncTask() (see README)
 *
 * Guarantees:
 *   - Single in-flight cycle (subsequent triggers are coalesced).
 *   - Push is idempotent via `localId`.
 *   - Pull is delta via `updatedAfter` cursor.
 *   - Photo uploads are decoupled (see upload-queue.ts) — surveys can
 *     sync metadata first; photos catch up async.
 */
import { env } from '@/src/config/env';
import type { StoredFloor, StoredPhoto, StoredSurvey } from '@/src/database/local-types';
import { surveyRepo } from '@/src/database/survey.repo';
import { HttpError } from '@/src/services/api/client';
import { syncService } from '@/src/services/sync/sync.service';
import { getAuthSessionUser } from '@/src/stores/auth-session';
import { useSyncStore } from '@/src/stores/sync';
import { uploadQueue } from '@/src/sync/upload-queue';
import type { SurveyUpdateRequest, SyncPullRequest, SyncPushRequest } from '@/src/types/api';

let cycleInFlight: Promise<SyncResult> | null = null;

export interface SyncResult {
  pushed: number;
  pulled: number;
  failed: number;
  durationMs: number;
  error?: string;
}

export const syncEngine = {
  /** Coalesced runner. Multiple callers share one cycle. */
  run(): Promise<SyncResult> {
    if (cycleInFlight) return cycleInFlight;
    cycleInFlight = doCycle().finally(() => {
      cycleInFlight = null;
    });
    return cycleInFlight;
  },

  /** Imperative kicker for the upload queue (photo metadata sync can wait). */
  kickUploads(): void {
    void uploadQueue.run();
  },
};

async function doCycle(): Promise<SyncResult> {
  const started = Date.now();
  const store = useSyncStore.getState();
  store.setCycleState('running');

  let pushed = 0;
  let pulled = 0;
  let failed = 0;
  let error: string | undefined;

  try {
    pushed = await pushDirty();
    pulled = await pullDelta();
    store.setLastSyncAt(new Date().toISOString());
    store.setCycleState('idle');
  } catch (err) {
    failed += 1;
    error = err instanceof Error ? err.message : 'sync_failed';
    store.setCycleState('failed', error);
  } finally {
    void uploadQueue.run();
  }

  return { pushed, pulled, failed, durationMs: Date.now() - started, error };
}

async function pushDirty(): Promise<number> {
  const batch: StoredSurvey[] = await surveyRepo.dirty(env.syncBatchSize);
  if (batch.length === 0) return 0;

  await surveyRepo.markBatchSyncing(batch.map((s) => s.id));

  const requestSurveys: SurveyUpdateRequest[] = await Promise.all(batch.map((s) => toUpdateRequest(s)));

  const body: SyncPushRequest = {
    surveys: requestSurveys,
    clientTimestamp: new Date().toISOString(),
  };

  try {
    const res = await syncService.push(body);
    await Promise.all(res.accepted.map((a) => surveyRepo.markSynced(a.localId, a.serverId)));
    await Promise.all(res.rejected.map((r) => surveyRepo.markFailed(r.localId, r.reason || 'rejected_by_server')));
    return res.accepted.length;
  } catch (err) {
    const message = err instanceof HttpError ? `${err.code}: ${err.message}` : 'network_error';
    await Promise.all(batch.map((s) => surveyRepo.markFailed(s.localId, message)));
    throw err;
  }
}

async function pullDelta(): Promise<number> {
  const auth = getAuthSessionUser();
  if (!auth) return 0;
  const lastSyncedAt = useSyncStore.getState().lastSyncAt;
  const body: SyncPullRequest = {
    lastSyncedAt,
    ulbCode: auth.ulbCode,
  };
  const res = await syncService.pull(body);
  for (const dto of res.surveys) {
    await surveyRepo.upsertFromServer(dto);
  }
  return res.surveys.length;
}

function toUpdateRequest(s: StoredSurvey): SurveyUpdateRequest {
  const floors = [...s.floors].sort((a, b) => a.position - b.position);
  const photos = s.photos;
  return {
    localId: s.localId,
    propertyNo: s.propertyNo,
    ulbCode: s.ulbCode,
    wardNo: s.wardNo,
    isSlum: s.isSlum,
    ownerName: s.ownerName,
    respondentName: s.respondentName,
    relationship: s.relationship,
    mobileNo: s.mobileNo,
    family: s.family,
    houseNo: s.houseNo,
    street: s.street,
    locality: s.locality,
    city: s.city,
    pinCode: s.pinCode,
    assessmentYear: s.assessmentYear,
    ownershipType: s.ownershipType,
    propertyType: s.propertyType,
    propertyUse: s.propertyUse,
    situation: s.situation,
    roadType: s.roadType,
    taxRateZone: s.taxRateZone,
    plotSqft: s.plotSqft,
    plinthSqft: s.plinthSqft,
    floors: floors.map((f: StoredFloor) => ({
      id: f.id,
      floorName: f.floorName,
      usageType: f.usageType,
      constructionType: f.constructionType,
      isOccupied: f.isOccupied,
      areaSqft: f.areaSqft,
    })),
    waterSource: s.waterSource,
    sanitationType: s.sanitationType,
    solidWasteType: s.solidWasteType,
    electricityNo: s.electricityNo,
    gps:
      s.gpsLat != null && s.gpsLng != null
        ? {
            latitude: s.gpsLat,
            longitude: s.gpsLng,
            accuracyMeters: s.gpsAccuracy ?? 0,
            capturedAt: s.gpsCapturedAt ?? new Date().toISOString(),
          }
        : null,
    photos: photos
      .filter((p: StoredPhoto) => p.serverKey)
      .map((p: StoredPhoto) => ({
        id: p.id,
        slot: p.slot,
        serverKey: p.serverKey!,
        sizeKb: p.sizeKb,
        width: p.width,
        height: p.height,
        capturedAt: p.capturedAt,
      })),
    status: s.status,
  };
}
