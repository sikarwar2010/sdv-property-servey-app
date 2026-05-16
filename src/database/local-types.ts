import type { QcRemark, SurveyStatus } from '@/src/types';

export type PhotoSlot = 'front' | 'side';
export type PhotoUploadState = 'pending' | 'uploading' | 'done' | 'failed';

export interface StoredFloor {
  id: string;
  surveyId: string;
  floorName: string;
  usageType: string;
  constructionType: string;
  isOccupied: boolean;
  areaSqft: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPhoto {
  id: string;
  surveyId: string;
  slot: PhotoSlot;
  localUri: string;
  serverKey?: string;
  sizeKb: number;
  width: number;
  height: number;
  uploadState: PhotoUploadState;
  uploadError?: string;
  retryCount: number;
  capturedAt: string;
  uploadedAt?: string;
}

/** Single persisted survey row (JSON in AsyncStorage). Floors and photos are nested for simple Go API / client sync. */
export interface StoredSurvey {
  id: string;
  localId: string;
  serverId?: string;
  surveyorId: string;
  status: SurveyStatus;
  propertyNo: string;
  ulbCode: string;
  wardNo: string;
  isSlum: boolean;
  ownerName: string;
  respondentName: string;
  relationship: string;
  mobileNo: string;
  family: number;
  houseNo: string;
  street: string;
  locality: string;
  city: string;
  pinCode: string;
  assessmentYear: string;
  ownershipType: string;
  propertyType: string;
  propertyUse: string;
  situation: string;
  roadType: string;
  taxRateZone: string;
  plotSqft: number;
  plinthSqft: number;
  waterSource: string;
  sanitationType: string;
  solidWasteType: string;
  electricityNo: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsAccuracy?: number;
  gpsCapturedAt?: string;
  wizardStep: number;
  isDirty: boolean;
  lastError?: string;
  retryCount: number;
  nextAttemptAt?: number;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
  floors: StoredFloor[];
  photos: StoredPhoto[];
  qcRemarks?: QcRemark[];
}
