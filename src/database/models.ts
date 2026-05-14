// @ts-nocheck
import type { SurveyStatus } from '@/src/types';
import { Model, Q, Query, Relation } from '@nozbe/watermelondb';
import { children, date, field, immutableRelation, readonly, text, writer } from '@nozbe/watermelondb/decorators';

/* ────────────────────────── Survey ────────────────────────── */

export class Survey extends Model {
  static table = 'surveys';
  static associations = {
    floors: { type: 'has_many' as const, foreignKey: 'survey_id' },
    photos: { type: 'has_many' as const, foreignKey: 'survey_id' },
  };

  @text('local_id') localId!: string;
  @text('server_id') serverId?: string;
  @text('surveyor_id') surveyorId!: string;
  @text('status') status!: SurveyStatus;

  @text('property_no') propertyNo!: string;
  @text('ulb_code') ulbCode!: string;
  @text('ward_no') wardNo!: string;
  @field('is_slum') isSlum!: boolean;

  @text('owner_name') ownerName!: string;
  @text('respondent_name') respondentName!: string;
  @text('relationship') relationship!: string;
  @text('mobile_no') mobileNo!: string;
  @field('family') family!: number;

  @text('house_no') houseNo!: string;
  @text('street') street!: string;
  @text('locality') locality!: string;
  @text('city') city!: string;
  @text('pin_code') pinCode!: string;

  @text('assessment_year') assessmentYear!: string;
  @text('ownership_type') ownershipType!: string;
  @text('property_type') propertyType!: string;
  @text('property_use') propertyUse!: string;
  @text('situation') situation!: string;
  @text('road_type') roadType!: string;
  @text('tax_rate_zone') taxRateZone!: string;

  @field('plot_sqft') plotSqft!: number;
  @field('plinth_sqft') plinthSqft!: number;

  @text('water_source') waterSource!: string;
  @text('sanitation_type') sanitationType!: string;
  @text('solid_waste_type') solidWasteType!: string;
  @text('electricity_no') electricityNo!: string;

  @field('gps_lat') gpsLat?: number;
  @field('gps_lng') gpsLng?: number;
  @field('gps_accuracy') gpsAccuracy?: number;
  @date('gps_captured_at') gpsCapturedAt?: Date;

  @field('wizard_step') wizardStep!: number;
  @field('is_dirty') isDirty!: boolean;
  @text('last_error') lastError?: string;
  @field('retry_count') retryCount!: number;
  @date('next_attempt_at') nextAttemptAt?: Date;
  @date('synced_at') syncedAt?: Date;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('floors') floors!: Query<Floor>;
  @children('photos') photos!: Query<Photo>;

  @writer async markPending() {
    await this.update((s) => {
      s.status = 'pending';
      s.isDirty = true;
      s.lastError = undefined;
      s.retryCount = 0;
      s.nextAttemptAt = undefined;
    });
  }

  @writer async markSyncing() {
    await this.update((s) => {
      s.status = 'syncing';
    });
  }

  @writer async markSynced(serverId: string) {
    await this.update((s) => {
      s.status = 'synced';
      s.serverId = serverId;
      s.isDirty = false;
      s.syncedAt = new Date();
      s.lastError = undefined;
      s.retryCount = 0;
      s.nextAttemptAt = undefined;
    });
  }

  @writer async markFailed(error: string, nextAttemptAt: Date) {
    await this.update((s) => {
      s.status = 'failed';
      s.lastError = error;
      s.retryCount = s.retryCount + 1;
      s.nextAttemptAt = nextAttemptAt;
    });
  }
}

/* ────────────────────────── Floor ────────────────────────── */

export class Floor extends Model {
  static table = 'floors';
  static associations = {
    surveys: { type: 'belongs_to' as const, key: 'survey_id' },
  };

  @text('survey_id') surveyId!: string;
  @text('floor_name') floorName!: string;
  @text('usage_type') usageType!: string;
  @text('construction_type') constructionType!: string;
  @field('is_occupied') isOccupied!: boolean;
  @field('area_sqft') areaSqft!: number;
  @field('position') position!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @immutableRelation('surveys', 'survey_id') survey!: Relation<Survey>;
}

/* ────────────────────────── Photo ────────────────────────── */

export type PhotoSlot = 'front' | 'side';
export type UploadState = 'pending' | 'uploading' | 'done' | 'failed';

export class Photo extends Model {
  static table = 'photos';
  static associations = {
    surveys: { type: 'belongs_to' as const, key: 'survey_id' },
  };

  @text('survey_id') surveyId!: string;
  @text('slot') slot!: PhotoSlot;
  @text('local_uri') localUri!: string;
  @text('server_key') serverKey?: string;
  @field('size_kb') sizeKb!: number;
  @field('width') width!: number;
  @field('height') height!: number;
  @text('upload_state') uploadState!: UploadState;
  @text('upload_error') uploadError?: string;
  @field('retry_count') retryCount!: number;
  @date('captured_at') capturedAt!: Date;
  @date('uploaded_at') uploadedAt?: Date;

  @immutableRelation('surveys', 'survey_id') survey!: Relation<Survey>;

  @writer async markUploading() {
    await this.update((p) => {
      p.uploadState = 'uploading';
    });
  }

  @writer async markDone(serverKey: string) {
    await this.update((p) => {
      p.uploadState = 'done';
      p.serverKey = serverKey;
      p.uploadedAt = new Date();
      p.uploadError = undefined;
    });
  }

  @writer async markFailed(error: string) {
    await this.update((p) => {
      p.uploadState = 'failed';
      p.uploadError = error;
      p.retryCount = p.retryCount + 1;
    });
  }
}

/* ────────────────────────── SyncQueueItem ────────────────────────── */

export type SyncKind = 'survey' | 'photo' | 'qc_remark';
export type SyncState = 'pending' | 'in_flight' | 'failed' | 'done';

export class SyncQueueItem extends Model {
  static table = 'sync_queue';

  @text('kind') kind!: SyncKind;
  @text('reference_id') referenceId!: string;
  @text('payload_json') payloadJson!: string;
  @text('state') state!: SyncState;
  @field('attempt_count') attemptCount!: number;
  @text('last_error') lastError?: string;
  @date('next_attempt_at') nextAttemptAt!: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}

/* ────────────────────────── MasterEntry ────────────────────────── */

export class MasterEntry extends Model {
  static table = 'masters_cache';

  @text('cache_key') cacheKey!: string;
  @text('version') version!: string;
  @text('payload_json') payloadJson!: string;
  @date('fetched_at') fetchedAt!: Date;
}

/* ────────────────────────── Query helpers ────────────────────────── */

export const surveyQueries = {
  dirty: () => Q.where('is_dirty', true),
  forStatus: (status: SurveyStatus) => Q.where('status', status),
  forSurveyor: (id: string) => Q.where('surveyor_id', id),
  byLocalId: (localId: string) => Q.where('local_id', localId),
  readyToRetry: () =>
    Q.and(
      Q.where('is_dirty', true),
      Q.or(Q.where('next_attempt_at', null), Q.where('next_attempt_at', Q.lte(Date.now()))),
    ),
};

export const photoQueries = {
  pendingUpload: () =>
    Q.and(Q.where('upload_state', Q.oneOf(['pending', 'failed'])), Q.where('local_uri', Q.notEq(''))),
  forSurvey: (surveyId: string) => Q.where('survey_id', surveyId),
};
