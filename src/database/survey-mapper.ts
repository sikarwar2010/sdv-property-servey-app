import type { StoredFloor, StoredPhoto, StoredSurvey } from '@/src/database/local-types';
import { ulbs } from '@/src/mocks/masters';
import type { DraftSurvey } from '@/src/stores/survey';
import type { FloorData, GpsCoord, PhotoRef, SurveyRecord } from '@/src/types';

const TOTAL_STEPS = 8;

function ulbNameFor(code: string): string {
  return ulbs.find((u) => u.code === code)?.name ?? code;
}

function addressLineFrom(s: StoredSurvey): string {
  return [s.houseNo, s.street, s.locality, s.city, s.pinCode]
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(', ');
}

function gpsFromSurvey(s: StoredSurvey): GpsCoord | null {
  if (s.gpsLat == null || s.gpsLng == null) return null;
  return {
    latitude: s.gpsLat,
    longitude: s.gpsLng,
    accuracyMeters: s.gpsAccuracy ?? 0,
    capturedAt: s.gpsCapturedAt ?? new Date().toISOString(),
  };
}

function floorsToDraft(floorRows: StoredFloor[]): FloorData[] {
  return floorRows.map((f) => ({
    id: f.id,
    floorNo: f.floorName.toLowerCase().replace(/\s+/g, '_') || 'ground',
    floorName: f.floorName,
    areaSqft: f.areaSqft,
    usageType: f.usageType,
    constructionType: f.constructionType,
    isOccupied: f.isOccupied,
  }));
}

function photosToDraft(photoRows: StoredPhoto[]): PhotoRef[] {
  return photoRows.map((p) => ({
    id: p.id,
    localUri: p.localUri,
    objectKey: p.serverKey,
    slot: p.slot,
    sizeKb: p.sizeKb,
    width: p.width,
    height: p.height,
    uploadStatus: p.uploadState === 'done' ? 'done' : p.uploadState === 'failed' ? 'failed' : 'idle',
  }));
}

/** Maps a persisted survey into the in-memory wizard draft. */
export function storedToDraft(s: StoredSurvey): DraftSurvey {
  return {
    id: s.localId,
    wmSurveyId: s.id,
    step: Math.max(1, Math.min(s.wizardStep || 1, TOTAL_STEPS)),
    assessmentYear: s.assessmentYear || '2025-26',
    ulbCode: s.ulbCode,
    ulbName: ulbNameFor(s.ulbCode),
    wardNo: s.wardNo,
    eNagarpalikaId: '',
    parcelNo: '',
    propertyNo: s.propertyNo,
    constructedYear: '',
    isSlum: s.isSlum,
    respondentName: s.respondentName,
    relationship: s.relationship || 'self',
    family: s.family,
    ownerName: s.ownerName,
    fatherOrHusbandName: '',
    mobileNo: s.mobileNo,
    alternateMobileNo: '',
    sectorNumber: '',
    houseNo: s.houseNo,
    streetName: s.street,
    locality: s.locality,
    colony: '',
    city: s.city,
    pinCode: s.pinCode,
    taxRateZone: s.taxRateZone || 'below_9m',
    ownershipType: s.ownershipType || 'individual',
    individualTenancy: 'single',
    propertyType: s.propertyType || 'residential',
    propertyUse: s.propertyUse || 'shop',
    roadType: s.roadType || 'kaccha',
    situation: s.situation || 'interior',
    plotSqft: s.plotSqft,
    plinthSqft: s.plinthSqft,
    floors: floorsToDraft(s.floors),
    waterSource: s.waterSource || 'municipal',
    sanitation: s.sanitationType || 'sewer',
    solidWaste: s.solidWasteType || 'door_to_door',
    electricityNo: s.electricityNo,
    gps: gpsFromSurvey(s),
    photos: photosToDraft(s.photos),
  };
}

/** Maps a persisted survey into a list/detail card record. */
export function storedToRecord(s: StoredSurvey): SurveyRecord {
  const floorRows = [...s.floors].sort((a, b) => a.position - b.position);
  const builtUp = floorRows.reduce((acc, f) => acc + f.areaSqft, 0);
  return {
    id: s.id,
    localId: s.localId,
    serverId: s.serverId,
    status: s.status,
    ownerName: s.ownerName,
    respondentName: s.respondentName,
    relationship: s.relationship,
    propertyNo: s.propertyNo,
    ulbCode: s.ulbCode,
    ulbName: ulbNameFor(s.ulbCode),
    wardNo: s.wardNo,
    addressLine: addressLineFrom(s),
    mobileNo: s.mobileNo,
    family: s.family,
    plotSqft: s.plotSqft,
    plinthSqft: s.plinthSqft,
    builtUpSqft: builtUp,
    floors: floorsToDraft(floorRows),
    gps: gpsFromSurvey(s) ?? undefined,
    photos: photosToDraft(s.photos),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    syncedAt: s.syncedAt,
    step: Math.max(1, s.wizardStep || 1),
    totalSteps: TOTAL_STEPS,
    qcRemarks: s.qcRemarks,
  };
}

/** @deprecated Use `storedToRecord` — kept for incremental refactors. */
export function surveyRowToRecord(s: StoredSurvey): SurveyRecord {
  return storedToRecord(s);
}

export function computeKpiFromRows(rows: StoredSurvey[]): import('@/src/types').KpiData {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  let drafts = 0;
  let pending = 0;
  let submitted = 0;
  let failed = 0;
  let today = 0;

  for (const s of rows) {
    const created = new Date(s.createdAt).getTime();
    if (created >= todayMs) today += 1;
    switch (s.status) {
      case 'draft':
        drafts += 1;
        break;
      case 'pending':
      case 'syncing':
        pending += 1;
        break;
      case 'synced':
        submitted += 1;
        break;
      case 'failed':
        failed += 1;
        break;
      default:
        break;
    }
  }

  return {
    total: rows.length,
    today,
    drafts,
    pending,
    submitted,
    failed,
  };
}
