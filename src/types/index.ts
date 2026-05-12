export type SurveyStatus = 'draft' | 'pending' | 'syncing' | 'synced' | 'failed';

export type UserRole =
  | 'super_admin'
  | 'district_admin'
  | 'ulb_admin'
  | 'officer_admin'
  | 'clerk_admin'
  | 'operator_admin'
  | 'manager_admin'
  | 'qc_officer'
  | 'surveyor';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  districtId: string;
  districtName: string;
  ulbCode: string;
  ulbName: string;
  wardAssignments: string[];
}

export interface Ulb {
  code: string;
  name: string;
}

export interface Ward {
  ulbCode: string;
  wardNo: string;
  name: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FloorData {
  id: string;
  floorNo: string;
  floorName: string;
  areaSqft: number;
  usageType: string;
  constructionType: string;
  isOccupied: boolean;
}

export interface PhotoRef {
  id: string;
  localUri: string;
  objectKey?: string;
  slot: 'front' | 'side' | 'inside' | 'document';
  sizeKb: number;
  uploadStatus: 'idle' | 'uploading' | 'done' | 'failed';
  uploadProgress?: number;
}

export interface GpsCoord {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

export interface SurveyRecord {
  id: string;
  localId: string;
  serverId?: string;
  status: SurveyStatus;
  ownerName: string;
  propertyNo: string;
  ulbCode: string;
  ulbName: string;
  wardNo: string;
  addressLine: string;
  mobileNo: string;
  family: number;
  plotSqft: number;
  plinthSqft: number;
  builtUpSqft: number;
  floors: FloorData[];
  gps?: GpsCoord;
  photos: PhotoRef[];
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  step: number;
  totalSteps: number;
  qcRemarks?: QcRemark[];
}

export interface QcRemark {
  id: string;
  author: string;
  authorRole: UserRole;
  message: string;
  taggedSections: string[];
  createdAt: string;
  resolved: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'sync_success' | 'qc_remark' | 'sync_failed' | 'target' | 'system';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface SyncQueueItem {
  id: string;
  surveyId: string;
  ownerName: string;
  wardNo: string;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  nextRetryAt?: string;
  progress?: number;
  errorMessage?: string;
}

export interface KpiData {
  total: number;
  today: number;
  drafts: number;
  pending: number;
  submitted: number;
  failed: number;
}
