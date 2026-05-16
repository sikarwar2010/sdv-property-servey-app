/**
 * Local survey repository — AsyncStorage-backed, sync-friendly shape for the Go API.
 */
import {
  ensureLocalSurveysLoaded,
  getLocalSurveysSnapshot,
  mutateLocalSurveys,
  subscribeLocalSurveys,
} from '@/src/database/local-store';
import type { StoredFloor, StoredPhoto, StoredSurvey } from '@/src/database/local-types';
import { storedToDraft } from '@/src/database/survey-mapper';
import type { DraftSurvey } from '@/src/stores/survey';
import type { SurveyStatus } from '@/src/types';
import type { SurveyCreateRequest, SurveyDto } from '@/src/types/api';
import { makeId } from '@/src/utils/format';

function nowIso(): string {
  return new Date().toISOString();
}

function filterSurveys(rows: StoredSurvey[], filter?: { status?: SurveyStatus; q?: string }): StoredSurvey[] {
  let list = [...rows];
  if (filter?.status) {
    list = list.filter((s) => s.status === filter.status);
  }
  if (filter?.q?.trim()) {
    const term = filter.q.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.ownerName.toLowerCase().includes(term) ||
        s.propertyNo.toLowerCase().includes(term) ||
        s.respondentName.toLowerCase().includes(term),
    );
  }
  list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return list;
}

function rxSubscribe<T>(setup: (emit: (v: T) => void) => () => void) {
  return {
    subscribe(observer: { next: (v: T) => void; error?: (e: unknown) => void }) {
      let cancelled = false;
      const emit = (v: T) => {
        if (!cancelled) observer.next(v);
      };
      const innerUnsub = setup(emit);
      return {
        unsubscribe() {
          cancelled = true;
          innerUnsub();
        },
      };
    },
  };
}

export const surveyRepo = {
  observeAll(filter?: { status?: SurveyStatus; q?: string }) {
    return rxSubscribe<StoredSurvey[]>((emit) => {
      void ensureLocalSurveysLoaded().then(() => {
        emit(filterSurveys(getLocalSurveysSnapshot(), filter));
      });
      return subscribeLocalSurveys(() => {
        emit(filterSurveys(getLocalSurveysSnapshot(), filter));
      });
    });
  },

  observeOne(id: string | undefined) {
    return rxSubscribe<StoredSurvey | null>((emit) => {
      void ensureLocalSurveysLoaded().then(() => {
        if (!id) {
          emit(null);
          return;
        }
        emit(getLocalSurveysSnapshot().find((s) => s.id === id) ?? null);
      });
      return subscribeLocalSurveys(() => {
        if (!id) {
          emit(null);
          return;
        }
        emit(getLocalSurveysSnapshot().find((s) => s.id === id) ?? null);
      });
    });
  },

  async findByLocalId(localId: string): Promise<StoredSurvey | null> {
    await ensureLocalSurveysLoaded();
    return getLocalSurveysSnapshot().find((s) => s.localId === localId) ?? null;
  },

  async createDraft(surveyorId: string): Promise<StoredSurvey> {
    const id = makeId('row');
    const ts = nowIso();
    const row: StoredSurvey = {
      id,
      localId: makeId('srv'),
      surveyorId,
      status: 'draft',
      propertyNo: '',
      ulbCode: '',
      wardNo: '',
      isSlum: false,
      ownerName: '',
      respondentName: '',
      relationship: '',
      mobileNo: '',
      family: 1,
      houseNo: '',
      street: '',
      locality: '',
      city: '',
      pinCode: '',
      assessmentYear: '',
      ownershipType: '',
      propertyType: '',
      propertyUse: '',
      situation: '',
      roadType: '',
      taxRateZone: '',
      plotSqft: 0,
      plinthSqft: 0,
      waterSource: '',
      sanitationType: '',
      solidWasteType: '',
      electricityNo: '',
      wizardStep: 1,
      isDirty: false,
      retryCount: 0,
      createdAt: ts,
      updatedAt: ts,
      floors: [],
      photos: [],
    };
    await mutateLocalSurveys((surveys) => {
      surveys.push(row);
    });
    return row;
  },

  async patch(id: string, patch: Partial<SurveyCreateRequest> & { wizardStep?: number }): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === id);
      if (!s) return;
      Object.assign(s, patch);
      s.updatedAt = nowIso();
    });
  },

  async markDirty(id: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === id);
      if (!s) return;
      s.status = 'pending';
      s.isDirty = true;
      s.lastError = undefined;
      s.retryCount = 0;
      s.nextAttemptAt = undefined;
      s.updatedAt = nowIso();
    });
  },

  async markBatchSyncing(ids: string[]): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const ts = nowIso();
      for (const s of surveys) {
        if (ids.includes(s.id)) {
          s.status = 'syncing';
          s.updatedAt = ts;
        }
      }
    });
  },

  async readWizardDraft(surveyRowId: string): Promise<DraftSurvey> {
    await ensureLocalSurveysLoaded();
    const survey = getLocalSurveysSnapshot().find((s) => s.id === surveyRowId);
    if (!survey) throw new Error(`Survey not found: ${surveyRowId}`);
    return storedToDraft(survey);
  },

  async writeWizardDraft(surveyRowId: string, draft: DraftSurvey): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const survey = surveys.find((s) => s.id === surveyRowId);
      if (!survey) return;
      const ts = nowIso();
      survey.wizardStep = draft.step;
      survey.propertyNo = draft.propertyNo.trim();
      survey.ulbCode = draft.ulbCode.trim();
      survey.wardNo = draft.wardNo.trim();
      survey.isSlum = draft.isSlum ?? false;
      survey.ownerName = draft.ownerName.trim();
      survey.respondentName = draft.respondentName.trim();
      survey.relationship = draft.relationship;
      survey.mobileNo = draft.mobileNo.trim();
      survey.family = draft.family;
      survey.houseNo = draft.houseNo.trim();
      survey.street = draft.streetName.trim();
      survey.locality = draft.locality.trim();
      survey.city = draft.city.trim();
      survey.pinCode = draft.pinCode.trim();
      survey.assessmentYear = draft.assessmentYear.trim();
      survey.ownershipType = draft.ownershipType;
      survey.propertyType = draft.propertyType;
      survey.propertyUse = draft.propertyUse;
      survey.situation = draft.situation;
      survey.roadType = draft.roadType;
      survey.taxRateZone = draft.taxRateZone;
      survey.plotSqft = draft.plotSqft;
      survey.plinthSqft = draft.plinthSqft;
      survey.waterSource = draft.waterSource;
      survey.sanitationType = draft.sanitation;
      survey.solidWasteType = draft.solidWaste;
      survey.electricityNo = draft.electricityNo.trim();
      if (draft.gps) {
        survey.gpsLat = draft.gps.latitude;
        survey.gpsLng = draft.gps.longitude;
        survey.gpsAccuracy = draft.gps.accuracyMeters;
        survey.gpsCapturedAt = draft.gps.capturedAt;
      } else {
        survey.gpsLat = undefined;
        survey.gpsLng = undefined;
        survey.gpsAccuracy = undefined;
        survey.gpsCapturedAt = undefined;
      }
      survey.updatedAt = ts;

      survey.floors = draft.floors.map((fl, i) => {
        const ft: StoredFloor = {
          id: fl.id || makeId('floor'),
          surveyId: surveyRowId,
          floorName: fl.floorName,
          usageType: fl.usageType,
          constructionType: fl.constructionType,
          isOccupied: fl.isOccupied,
          areaSqft: fl.areaSqft,
          position: i,
          createdAt: ts,
          updatedAt: ts,
        };
        return ft;
      });

      survey.photos = draft.photos.map((ph) => {
        const uploadState =
          ph.uploadStatus === 'done'
            ? ('done' as const)
            : ph.uploadStatus === 'failed'
              ? ('failed' as const)
              : ph.uploadStatus === 'uploading'
                ? ('uploading' as const)
                : ('pending' as const);
        const p: StoredPhoto = {
          id: ph.id || makeId('photo'),
          surveyId: surveyRowId,
          slot: ph.slot,
          localUri: ph.localUri,
          serverKey: ph.objectKey,
          sizeKb: ph.sizeKb,
          width: ph.width ?? 0,
          height: ph.height ?? 0,
          uploadState,
          retryCount: 0,
          capturedAt: ts,
        };
        return p;
      });
    });
  },

  async markSynced(localId: string, serverId: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.localId === localId);
      if (!s) return;
      const ts = nowIso();
      s.status = 'synced';
      s.serverId = serverId;
      s.isDirty = false;
      s.syncedAt = ts;
      s.lastError = undefined;
      s.retryCount = 0;
      s.nextAttemptAt = undefined;
      s.updatedAt = ts;
    });
  },

  async markFailed(localId: string, error: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.localId === localId);
      if (!s) return;
      const delays = [30, 120, 480, 1800, 7200, 86_400];
      const delay = delays[Math.min(s.retryCount, delays.length - 1)] ?? 86_400;
      const ts = nowIso();
      s.status = 'failed';
      s.lastError = error;
      s.retryCount = s.retryCount + 1;
      s.nextAttemptAt = Date.now() + delay * 1000;
      s.updatedAt = ts;
    });
  },

  async dirty(limit: number): Promise<StoredSurvey[]> {
    await ensureLocalSurveysLoaded();
    const now = Date.now();
    const rows = getLocalSurveysSnapshot().filter(
      (s) => s.isDirty && (s.nextAttemptAt == null || s.nextAttemptAt <= now),
    );
    rows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return rows.slice(0, limit);
  },

  async upsertFromServer(dto: SurveyDto): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const idx = surveys.findIndex((s) => s.localId === dto.localId);
      const id = idx >= 0 ? surveys[idx]!.id : makeId('row');
      const mapped = mapDtoToStored(dto, id);
      if (idx >= 0) surveys[idx] = mapped;
      else surveys.push(mapped);
    });
  },

  async delete(id: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const idx = surveys.findIndex((s) => s.id === id);
      if (idx >= 0) surveys.splice(idx, 1);
    });
  },
};

export const floorRepo = {
  observeForSurvey(surveyId: string | undefined) {
    return rxSubscribe<StoredFloor[]>((emit) => {
      const run = () => {
        if (!surveyId) {
          emit([]);
          return;
        }
        const s = getLocalSurveysSnapshot().find((x) => x.id === surveyId);
        emit(s ? [...s.floors].sort((a, b) => a.position - b.position) : []);
      };
      void ensureLocalSurveysLoaded().then(run);
      return subscribeLocalSurveys(run);
    });
  },

  async add(surveyId: string, data: Omit<FloorInput, 'surveyId'>): Promise<StoredFloor> {
    const ts = nowIso();
    let created: StoredFloor | null = null;
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === surveyId);
      if (!s) return;
      const f: StoredFloor = {
        id: makeId('floor'),
        surveyId,
        floorName: data.floorName,
        usageType: data.usageType,
        constructionType: data.constructionType,
        isOccupied: data.isOccupied,
        areaSqft: data.areaSqft,
        position: data.position,
        createdAt: ts,
        updatedAt: ts,
      };
      s.floors.push(f);
      s.updatedAt = ts;
      created = f;
    });
    return created!;
  },

  async update(id: string, patch: Partial<FloorInput>): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      for (const s of surveys) {
        const f = s.floors.find((x) => x.id === id);
        if (f) {
          Object.assign(f, patch);
          f.updatedAt = nowIso();
          s.updatedAt = f.updatedAt;
          return;
        }
      }
    });
  },

  async remove(id: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      for (const s of surveys) {
        const idx = s.floors.findIndex((x) => x.id === id);
        if (idx >= 0) {
          s.floors.splice(idx, 1);
          s.updatedAt = nowIso();
          return;
        }
      }
    });
  },
};

export const photoRepo = {
  observeForSurvey(surveyId: string | undefined) {
    return rxSubscribe<StoredPhoto[]>((emit) => {
      const run = () => {
        if (!surveyId) {
          emit([]);
          return;
        }
        const s = getLocalSurveysSnapshot().find((x) => x.id === surveyId);
        emit(s ? [...s.photos] : []);
      };
      void ensureLocalSurveysLoaded().then(run);
      return subscribeLocalSurveys(run);
    });
  },

  async pendingUpload(limit: number): Promise<StoredPhoto[]> {
    await ensureLocalSurveysLoaded();
    const out: StoredPhoto[] = [];
    for (const s of getLocalSurveysSnapshot()) {
      for (const p of s.photos) {
        if (p.localUri && (p.uploadState === 'pending' || p.uploadState === 'failed')) {
          out.push(p);
        }
        if (out.length >= limit) return out;
      }
    }
    return out;
  },

  async add(input: PhotoInput): Promise<StoredPhoto> {
    const ts = nowIso();
    let created: StoredPhoto | null = null;
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === input.surveyId);
      if (!s) return;
      const p: StoredPhoto = {
        id: makeId('photo'),
        surveyId: input.surveyId,
        slot: input.slot,
        localUri: input.localUri,
        sizeKb: input.sizeKb,
        width: input.width,
        height: input.height,
        uploadState: 'pending',
        retryCount: 0,
        capturedAt: input.capturedAt,
      };
      s.photos.push(p);
      s.updatedAt = ts;
      created = p;
    });
    return created!;
  },

  async markUploading(surveyId: string, photoId: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === surveyId);
      const p = s?.photos.find((x) => x.id === photoId);
      if (!p || !s) return;
      p.uploadState = 'uploading';
      s.updatedAt = nowIso();
    });
  },

  async markDone(surveyId: string, photoId: string, serverKey: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === surveyId);
      const p = s?.photos.find((x) => x.id === photoId);
      if (!p || !s) return;
      const ts = nowIso();
      p.uploadState = 'done';
      p.serverKey = serverKey;
      p.uploadedAt = ts;
      p.uploadError = undefined;
      s.updatedAt = ts;
    });
  },

  async markFailed(surveyId: string, photoId: string, error: string): Promise<void> {
    await mutateLocalSurveys((surveys) => {
      const s = surveys.find((x) => x.id === surveyId);
      const p = s?.photos.find((x) => x.id === photoId);
      if (!p || !s) return;
      p.uploadState = 'failed';
      p.uploadError = error;
      p.retryCount = p.retryCount + 1;
      s.updatedAt = nowIso();
    });
  },
};

interface FloorInput {
  surveyId: string;
  floorName: string;
  usageType: string;
  constructionType: string;
  isOccupied: boolean;
  areaSqft: number;
  position: number;
}

interface PhotoInput {
  surveyId: string;
  slot: 'front' | 'side';
  localUri: string;
  sizeKb: number;
  width: number;
  height: number;
  capturedAt: string;
}

function mapDtoToStored(dto: SurveyDto, id: string): StoredSurvey {
  const ts = dto.updatedAt || nowIso();
  const floors: StoredFloor[] = dto.floors.map((f, i) => ({
    id: f.id,
    surveyId: id,
    floorName: f.floorName,
    usageType: f.usageType,
    constructionType: f.constructionType,
    isOccupied: f.isOccupied,
    areaSqft: f.areaSqft,
    position: i,
    createdAt: ts,
    updatedAt: ts,
  }));
  const photos: StoredPhoto[] = dto.photos.map((ph) => ({
    id: ph.id,
    surveyId: id,
    slot: ph.slot,
    localUri: '',
    serverKey: ph.serverKey,
    sizeKb: ph.sizeKb ?? 0,
    width: ph.width ?? 0,
    height: ph.height ?? 0,
    uploadState: ph.serverKey ? 'done' : 'pending',
    retryCount: 0,
    capturedAt: ph.capturedAt,
    uploadedAt: ph.serverKey ? ts : undefined,
  }));
  return {
    id,
    localId: dto.localId,
    serverId: dto.id,
    surveyorId: dto.surveyorId,
    status: dto.status,
    isDirty: false,
    lastError: undefined,
    retryCount: 0,
    nextAttemptAt: undefined,
    propertyNo: dto.propertyNo,
    ulbCode: dto.ulbCode,
    wardNo: dto.wardNo,
    isSlum: dto.isSlum,
    ownerName: dto.ownerName,
    respondentName: dto.respondentName,
    relationship: dto.relationship,
    mobileNo: dto.mobileNo,
    family: dto.family,
    houseNo: dto.houseNo,
    street: dto.street,
    locality: dto.locality,
    city: dto.city,
    pinCode: dto.pinCode,
    assessmentYear: dto.assessmentYear,
    ownershipType: dto.ownershipType,
    propertyType: dto.propertyType,
    propertyUse: dto.propertyUse,
    situation: dto.situation,
    roadType: dto.roadType,
    taxRateZone: dto.taxRateZone,
    plotSqft: dto.plotSqft,
    plinthSqft: dto.plinthSqft,
    waterSource: dto.waterSource,
    sanitationType: dto.sanitationType,
    solidWasteType: dto.solidWasteType,
    electricityNo: dto.electricityNo,
    gpsLat: dto.gps?.latitude,
    gpsLng: dto.gps?.longitude,
    gpsAccuracy: dto.gps?.accuracyMeters,
    gpsCapturedAt: dto.gps?.capturedAt,
    wizardStep: 1,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    syncedAt: dto.syncedAt,
    floors,
    photos,
  };
}
