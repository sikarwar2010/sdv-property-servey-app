/**
 * API contracts inferred from the existing service layer and form fields.
 * Mirrors the Golang + Gin backend shape. Use these types in service modules
 * and React Query hooks for end-to-end type safety.
 */

import type { SurveyStatus, UserRole } from './index';

/* ────────────────────────── Common ────────────────────────── */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>; // field → messages
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    nextCursor?: string | null;
  };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/* ────────────────────────── Auth ────────────────────────── */

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  fcmToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
  refreshExpiresAt: string; // ISO
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ulbCode: string;
  ulbName: string;
  districtName: string;
  wardAssignments: string[];
  createdAt: string;
}

export interface LoginResponse {
  user: AuthUserDto;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

/* ────────────────────────── Masters ────────────────────────── */

export interface MastersBundle {
  version: string; // server-side hash; cached client-side
  updatedAt: string;
  ulbs: Array<{ code: string; name: string; districtName: string; stateName: string }>;
  wards: Array<{ ulbCode: string; wardNo: string; name: string }>;
  assessmentYears: Array<{ value: string; label: string }>;
  ownershipTypes: Array<{ value: string; label: string }>;
  propertyTypes: Array<{ value: string; label: string }>;
  propertyUses: Array<{ value: string; label: string }>;
  situations: Array<{ value: string; label: string }>;
  roadTypes: Array<{ value: string; label: string }>;
  taxRateZones: Array<{ value: string; label: string }>;
  relationships: Array<{ value: string; label: string }>;
  waterSources: Array<{ value: string; label: string }>;
  sanitationTypes: Array<{ value: string; label: string }>;
  solidWasteTypes: Array<{ value: string; label: string }>;
  usageTypes: Array<{ value: string; label: string }>;
  constructionTypes: Array<{ value: string; label: string }>;
  floors: Array<{ value: string; label: string }>;
}

/* ────────────────────────── Surveys ────────────────────────── */

export interface FloorDto {
  id: string;
  floorName: string;
  usageType: string;
  constructionType: string;
  isOccupied: boolean;
  areaSqft: number;
}

export interface GpsDto {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

export interface PhotoDto {
  id: string;
  slot: 'front' | 'side';
  serverKey?: string; // S3 key once uploaded
  sizeKb?: number;
  width?: number;
  height?: number;
  capturedAt: string;
}

export interface SurveyDto {
  id: string; // server id (UUID)
  localId: string; // client-generated idempotency key
  status: SurveyStatus;
  // section 1: property
  propertyNo: string;
  ulbCode: string;
  wardNo: string;
  isSlum: boolean;
  // section 2: owner
  ownerName: string;
  respondentName: string;
  relationship: string;
  mobileNo: string;
  family: number;
  // section 3: address
  houseNo: string;
  street: string;
  locality: string;
  /** Optional; supported when server / client both handle it. */
  colony?: string;
  city: string;
  pinCode: string;
  // section 4: taxation
  assessmentYear: string;
  ownershipType: string;
  propertyType: string;
  propertyUse: string;
  situation: string;
  roadType: string;
  taxRateZone: string;
  // section 5: area + floors
  plotSqft: number;
  plinthSqft: number;
  floors: FloorDto[];
  // section 6: services
  waterSource: string;
  sanitationType: string;
  solidWasteType: string;
  electricityNo: string;
  // section 7: GIS
  gps: GpsDto | null;
  // section 8: photos
  photos: PhotoDto[];
  // meta
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  surveyorId: string;
}

export type SurveyCreateRequest = Omit<SurveyDto, 'id' | 'syncedAt' | 'createdAt' | 'updatedAt' | 'surveyorId'>;
export type SurveyUpdateRequest = Partial<SurveyCreateRequest> & { localId: string };

export interface SurveyListQuery {
  page?: number;
  pageSize?: number;
  status?: SurveyStatus | 'all';
  wardNo?: string;
  q?: string;
  updatedAfter?: string; // for delta pull
}

/* ────────────────────────── Sync ────────────────────────── */

export interface SyncPushRequest {
  surveys: SurveyUpdateRequest[];
  clientTimestamp: string;
}

export interface SyncPushResponse {
  accepted: Array<{ localId: string; serverId: string; updatedAt: string }>;
  rejected: Array<{ localId: string; reason: string; fieldErrors?: Record<string, string[]> }>;
}

export interface SyncPullRequest {
  lastSyncedAt: string | null;
  ulbCode: string;
}

export interface SyncPullResponse {
  surveys: SurveyDto[];
  serverTimestamp: string;
  hasMore: boolean;
  cursor?: string;
}

/* ────────────────────────── Uploads ────────────────────────── */

export interface PhotoUploadResponse {
  photoId: string;
  serverKey: string;
  url: string;
  width: number;
  height: number;
  sizeKb: number;
}

/* ────────────────────────── QC ────────────────────────── */

export interface QcRemarkDto {
  id: string;
  surveyId: string;
  authorId: string;
  authorName: string;
  authorRole: 'supervisor' | 'surveyor';
  message: string;
  taggedSections: string[];
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface QcRemarkCreateRequest {
  surveyId: string;
  message: string;
  taggedSections?: string[];
}
