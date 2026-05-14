/**
 * Repository layer between WatermelonDB and the rest of the app.
 * Keeps WMDB query/Q syntax confined to this file.
 */
import type { DraftSurvey } from '@/src/stores/survey';
import type { SurveyStatus } from '@/src/types';
import type { SurveyCreateRequest, SurveyDto } from '@/src/types/api';
import { makeId } from '@/src/utils/format';
import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import { Floor, Photo, Survey, photoQueries, surveyQueries } from './models';

const surveys = () => database.get<Survey>('surveys');
const floors = () => database.get<Floor>('floors');
const photos = () => database.get<Photo>('photos');

export const surveyRepo = {
  /** Reactive observable for live list rendering. */
  observeAll(filter?: { status?: SurveyStatus; q?: string }) {
    const conditions = [];
    if (filter?.status && filter.status !== 'draft') {
      conditions.push(Q.where('status', filter.status));
    }
    if (filter?.q) {
      const term = filter.q.toLowerCase();
      conditions.push(
        Q.or(
          Q.where('owner_name', Q.like(`%${Q.sanitizeLikeString(term)}%`)),
          Q.where('property_no', Q.like(`%${Q.sanitizeLikeString(term)}%`)),
        ),
      );
    }
    return surveys()
      .query(...conditions, Q.sortBy('updated_at', Q.desc))
      .observe();
  },

  observeOne(id: string) {
    return surveys().findAndObserve(id);
  },

  async findByLocalId(localId: string): Promise<Survey | null> {
    const rows = await surveys().query(surveyQueries.byLocalId(localId)).fetch();
    return rows[0] ?? null;
  },

  async createDraft(surveyorId: string): Promise<Survey> {
    let created: Survey | null = null;
    await database.write(async () => {
      created = await surveys().create((s) => {
        s.localId = makeId('srv');
        s.surveyorId = surveyorId;
        s.status = 'draft';
        s.propertyNo = '';
        s.ulbCode = '';
        s.wardNo = '';
        s.isSlum = false;
        s.ownerName = '';
        s.respondentName = '';
        s.relationship = '';
        s.mobileNo = '';
        s.family = 1;
        s.houseNo = '';
        s.street = '';
        s.locality = '';
        s.city = '';
        s.pinCode = '';
        s.assessmentYear = '';
        s.ownershipType = '';
        s.propertyType = '';
        s.propertyUse = '';
        s.situation = '';
        s.roadType = '';
        s.taxRateZone = '';
        s.plotSqft = 0;
        s.plinthSqft = 0;
        s.waterSource = '';
        s.sanitationType = '';
        s.solidWasteType = '';
        s.electricityNo = '';
        s.wizardStep = 1;
        s.isDirty = false;
        s.retryCount = 0;
      });
    });
    return created!;
  },

  async patch(id: string, patch: Partial<SurveyCreateRequest> & { wizardStep?: number }): Promise<void> {
    const survey = await surveys().find(id);
    await database.write(async () => {
      await survey.update((s) => {
        Object.assign(s, patch);
      });
    });
  },

  async markDirty(id: string): Promise<void> {
    const survey = await surveys().find(id);
    await survey.markPending();
  },

  /**
   * Persists the in-memory wizard draft into the local WatermelonDB survey row,
   * including floors and photos (replaces existing children).
   */
  async writeWizardDraft(surveyRowId: string, draft: DraftSurvey): Promise<void> {
    const survey = await surveys().find(surveyRowId);
    const [existingFloors, existingPhotos] = await Promise.all([
      floors().query(Q.where('survey_id', surveyRowId)).fetch(),
      photos().query(Q.where('survey_id', surveyRowId)).fetch(),
    ]);

    await database.write(async () => {
      for (const f of existingFloors) {
        await f.destroyPermanently();
      }
      for (const p of existingPhotos) {
        await p.destroyPermanently();
      }

      await survey.update((s) => {
        s.wizardStep = draft.step;
        s.propertyNo = draft.propertyNo.trim();
        s.ulbCode = draft.ulbCode.trim();
        s.wardNo = draft.wardNo.trim();
        s.isSlum = draft.isSlum ?? false;
        s.ownerName = draft.ownerName.trim();
        s.respondentName = draft.respondentName.trim();
        s.relationship = draft.relationship;
        s.mobileNo = draft.mobileNo.trim();
        s.family = draft.family;
        s.houseNo = draft.houseNo.trim();
        s.street = draft.streetName.trim();
        s.locality = draft.locality.trim();
        s.city = draft.city.trim();
        s.pinCode = draft.pinCode.trim();
        s.assessmentYear = draft.assessmentYear.trim();
        s.ownershipType = draft.ownershipType;
        s.propertyType = draft.propertyType;
        s.propertyUse = draft.propertyUse;
        s.situation = draft.situation;
        s.roadType = draft.roadType;
        s.taxRateZone = draft.taxRateZone;
        s.plotSqft = draft.plotSqft;
        s.plinthSqft = draft.plinthSqft;
        s.waterSource = draft.waterSource;
        s.sanitationType = draft.sanitation;
        s.solidWasteType = draft.solidWaste;
        s.electricityNo = draft.electricityNo.trim();
        if (draft.gps) {
          s.gpsLat = draft.gps.latitude;
          s.gpsLng = draft.gps.longitude;
          s.gpsAccuracy = draft.gps.accuracyMeters;
          s.gpsCapturedAt = new Date(draft.gps.capturedAt);
        } else {
          s.gpsLat = undefined;
          s.gpsLng = undefined;
          s.gpsAccuracy = undefined;
          s.gpsCapturedAt = undefined;
        }
      });

      for (let i = 0; i < draft.floors.length; i++) {
        const fl = draft.floors[i]!;
        await floors().create((f) => {
          f.surveyId = surveyRowId;
          f.floorName = fl.floorName;
          f.usageType = fl.usageType;
          f.constructionType = fl.constructionType;
          f.isOccupied = fl.isOccupied;
          f.areaSqft = fl.areaSqft;
          f.position = i;
        });
      }

      const now = new Date();
      for (const ph of draft.photos) {
        await photos().create((p) => {
          p.surveyId = surveyRowId;
          p.slot = ph.slot;
          p.localUri = ph.localUri;
          p.sizeKb = ph.sizeKb;
          p.width = ph.width ?? 0;
          p.height = ph.height ?? 0;
          p.uploadState = 'pending';
          p.retryCount = 0;
          p.capturedAt = now;
        });
      }
    });
  },

  async markSynced(localId: string, serverId: string): Promise<void> {
    const survey = await this.findByLocalId(localId);
    if (survey) await survey.markSynced(serverId);
  },

  async markFailed(localId: string, error: string): Promise<void> {
    const survey = await this.findByLocalId(localId);
    if (!survey) return;
    // Exponential backoff: 30s, 2m, 8m, 30m, 2h, max 24h.
    const delays = [30, 120, 480, 1800, 7200, 86_400];
    const delay = delays[Math.min(survey.retryCount, delays.length - 1)] ?? 86_400;
    await survey.markFailed(error, new Date(Date.now() + delay * 1000));
  },

  /** Pull dirty rows to push. */
  async dirty(limit: number): Promise<Survey[]> {
    return surveys().query(surveyQueries.readyToRetry(), Q.take(limit)).fetch();
  },

  /** Apply a SurveyDto from server (after pull) — upserts by localId. */
  async upsertFromServer(dto: SurveyDto): Promise<void> {
    const existing = await this.findByLocalId(dto.localId);
    await database.write(async () => {
      if (existing) {
        await existing.update((s) => {
          assignDto(s, dto);
          s.isDirty = false;
        });
      } else {
        await surveys().create((s) => {
          assignDto(s, dto);
          s.isDirty = false;
        });
      }
    });
  },

  async delete(id: string): Promise<void> {
    const survey = await surveys().find(id);
    await database.write(async () => {
      await survey.markAsDeleted();
    });
  },
};

export const floorRepo = {
  observeForSurvey(surveyId: string) {
    return floors().query(Q.where('survey_id', surveyId), Q.sortBy('position', Q.asc)).observe();
  },
  async add(surveyId: string, data: Omit<FloorInput, 'surveyId'>): Promise<Floor> {
    let created: Floor | null = null;
    await database.write(async () => {
      created = await floors().create((f) => {
        f.surveyId = surveyId;
        f.floorName = data.floorName;
        f.usageType = data.usageType;
        f.constructionType = data.constructionType;
        f.isOccupied = data.isOccupied;
        f.areaSqft = data.areaSqft;
        f.position = data.position;
      });
    });
    return created!;
  },
  async update(id: string, patch: Partial<FloorInput>): Promise<void> {
    const floor = await floors().find(id);
    await database.write(async () => {
      await floor.update((f) => {
        Object.assign(f, patch);
      });
    });
  },
  async remove(id: string): Promise<void> {
    const floor = await floors().find(id);
    await database.write(async () => {
      await floor.markAsDeleted();
    });
  },
};

export const photoRepo = {
  observeForSurvey(surveyId: string) {
    return photos().query(photoQueries.forSurvey(surveyId)).observe();
  },
  pendingUpload(limit: number) {
    return photos().query(photoQueries.pendingUpload(), Q.take(limit)).fetch();
  },
  async add(input: PhotoInput): Promise<Photo> {
    let created: Photo | null = null;
    await database.write(async () => {
      created = await photos().create((p) => {
        p.surveyId = input.surveyId;
        p.slot = input.slot;
        p.localUri = input.localUri;
        p.sizeKb = input.sizeKb;
        p.width = input.width;
        p.height = input.height;
        p.uploadState = 'pending';
        p.retryCount = 0;
        p.capturedAt = new Date(input.capturedAt);
      });
    });
    return created!;
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

function assignDto(s: Survey, dto: SurveyDto) {
  s.localId = dto.localId;
  s.serverId = dto.id;
  s.surveyorId = dto.surveyorId;
  s.status = dto.status;
  s.propertyNo = dto.propertyNo;
  s.ulbCode = dto.ulbCode;
  s.wardNo = dto.wardNo;
  s.isSlum = dto.isSlum;
  s.ownerName = dto.ownerName;
  s.respondentName = dto.respondentName;
  s.relationship = dto.relationship;
  s.mobileNo = dto.mobileNo;
  s.family = dto.family;
  s.houseNo = dto.houseNo;
  s.street = dto.street;
  s.locality = dto.locality;
  s.city = dto.city;
  s.pinCode = dto.pinCode;
  s.assessmentYear = dto.assessmentYear;
  s.ownershipType = dto.ownershipType;
  s.propertyType = dto.propertyType;
  s.propertyUse = dto.propertyUse;
  s.situation = dto.situation;
  s.roadType = dto.roadType;
  s.taxRateZone = dto.taxRateZone;
  s.plotSqft = dto.plotSqft;
  s.plinthSqft = dto.plinthSqft;
  s.waterSource = dto.waterSource;
  s.sanitationType = dto.sanitationType;
  s.solidWasteType = dto.solidWasteType;
  s.electricityNo = dto.electricityNo;
  if (dto.gps) {
    s.gpsLat = dto.gps.latitude;
    s.gpsLng = dto.gps.longitude;
    s.gpsAccuracy = dto.gps.accuracyMeters;
    s.gpsCapturedAt = new Date(dto.gps.capturedAt);
  }
  s.syncedAt = dto.syncedAt ? new Date(dto.syncedAt) : undefined;
}
