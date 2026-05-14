import { surveyRepo } from '@/src/database/survey.repo';
import { kpiData as initialKpi, mockNotifications, mockSurveys, mockSyncQueue } from '@/src/mocks/surveys';
import { syncEngine } from '@/src/sync/sync-engine';
import type { FloorData, GpsCoord, NotificationItem, PhotoRef, SurveyRecord, SyncQueueItem } from '@/src/types';
import { makeId } from '@/src/utils/format';
import { create } from 'zustand';

interface DraftSurvey {
  id: string;
  /** WatermelonDB `surveys.id` for this draft; set when starting from New survey. */
  wmSurveyId?: string;
  step: number;
  // Step 1 — Property details
  assessmentYear: string;
  ulbCode: string;
  ulbName: string;
  wardNo: string;
  eNagarpalikaId: string;
  parcelNo: string;
  propertyNo: string;
  constructedYear: string;
  isSlum: boolean | null;
  // Step 2 - Owner
  respondentName: string;
  relationship: string;
  family: number;
  ownerName: string;
  fatherOrHusbandName: string;
  mobileNo: string;
  alternateMobileNo: string;
  // Step 3 - Address
  sectorNumber: string;
  houseNo: string;
  streetName: string;
  locality: string;
  colony: string;
  city: string;
  pinCode: string;
  // Step 4 - Taxation
  taxRateZone: string;
  ownershipType: string;
  /** Required when `ownershipType` is `individual`. */
  individualTenancy: string;
  propertyType: string;
  propertyUse: string;
  roadType: string;
  situation: string;
  // Step 5 - Area & floors
  plotSqft: number;
  plinthSqft: number;
  floors: FloorData[];
  // Step 6 - Services
  waterSource: string;
  sanitation: string;
  solidWaste: string;
  electricityNo: string;
  // Step 7 - GPS
  gps: GpsCoord | null;
  // Step 8 - Photos
  photos: PhotoRef[];
}

const emptyDraft = (): DraftSurvey => ({
  id: makeId('draft'),
  wmSurveyId: undefined,
  step: 1,
  assessmentYear: '2025-26',
  ulbCode: 'MNP-027',
  ulbName: 'Mathura Nagar Panchayat',
  wardNo: '12',
  eNagarpalikaId: '',
  parcelNo: '',
  propertyNo: '',
  constructedYear: '',
  isSlum: false,
  respondentName: '',
  relationship: 'self',
  family: 1,
  ownerName: '',
  fatherOrHusbandName: '',
  mobileNo: '',
  alternateMobileNo: '',
  sectorNumber: '',
  houseNo: '',
  streetName: '',
  locality: '',
  colony: '',
  city: 'Mathura',
  pinCode: '',
  taxRateZone: 'below_9m',
  ownershipType: 'individual',
  individualTenancy: 'single',
  propertyType: 'residential',
  propertyUse: 'shop',
  roadType: 'kaccha',
  situation: 'interior',
  plotSqft: 0,
  plinthSqft: 0,
  floors: [],
  waterSource: 'municipal',
  sanitation: 'sewer',
  solidWaste: 'door_to_door',
  electricityNo: '',
  gps: null,
  photos: [],
});

interface SurveyState {
  surveys: SurveyRecord[];
  notifications: NotificationItem[];
  syncQueue: SyncQueueItem[];
  draft: DraftSurvey | null;
  kpi: typeof initialKpi;
  startDraft: () => void;
  updateDraft: (patch: Partial<DraftSurvey>) => void;
  addFloor: (floor: Omit<FloorData, 'id'>) => void;
  updateFloor: (id: string, patch: Partial<FloorData>) => void;
  removeFloor: (id: string) => void;
  saveDraft: () => void | Promise<void>;
  cancelDraft: () => void;
  submitSurvey: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: mockSurveys,
  notifications: mockNotifications,
  syncQueue: mockSyncQueue,
  draft: null,
  kpi: initialKpi,

  startDraft: () => set({ draft: emptyDraft() }),

  updateDraft: (patch) => set((state) => ({ draft: state.draft ? { ...state.draft, ...patch } : null })),

  addFloor: (floor) =>
    set((state) => {
      if (!state.draft) return state;
      const next: FloorData = { ...floor, id: makeId('floor') };
      return { draft: { ...state.draft, floors: [...state.draft.floors, next] } };
    }),

  updateFloor: (id, patch) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          floors: state.draft.floors.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        },
      };
    }),

  removeFloor: (id) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, floors: state.draft.floors.filter((f) => f.id !== id) },
      };
    }),

  saveDraft: async () => {
    const { draft } = get();
    if (!draft?.wmSurveyId) {
      // eslint-disable-next-line no-console
      console.log('[draft saved] no Watermelon row yet — continue from New survey first');
      return;
    }
    await surveyRepo.writeWizardDraft(draft.wmSurveyId, draft);
  },

  cancelDraft: () => set({ draft: null }),

  submitSurvey: async () => {
    const { draft, surveys, kpi } = get();
    if (!draft || !draft.wmSurveyId) return;

    await surveyRepo.writeWizardDraft(draft.wmSurveyId, draft);
    await surveyRepo.markDirty(draft.wmSurveyId);
    void syncEngine.run();

    const now = new Date().toISOString();
    const builtUp = draft.floors.reduce((acc, f) => acc + f.areaSqft, 0);
    const newSurvey: SurveyRecord = {
      id: makeId('s'),
      localId: draft.id,
      status: 'pending',
      ownerName: draft.ownerName.trim() || draft.respondentName.trim() || 'Untitled',
      respondentName: draft.respondentName,
      relationship: draft.relationship,
      fatherOrHusbandName: draft.fatherOrHusbandName,
      alternateMobileNo: draft.alternateMobileNo,
      propertyNo:
        draft.propertyNo ||
        `PR-${draft.wardNo}-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(5, '0')}`,
      ulbCode: draft.ulbCode,
      ulbName: draft.ulbName,
      wardNo: draft.wardNo,
      addressLine: [draft.houseNo, draft.streetName, draft.locality, draft.colony, draft.city, draft.pinCode]
        .map((s) => String(s).trim())
        .filter(Boolean)
        .join(', '),
      mobileNo: draft.mobileNo,
      family: draft.family,
      plotSqft: draft.plotSqft,
      plinthSqft: draft.plinthSqft,
      builtUpSqft: builtUp,
      floors: draft.floors,
      gps: draft.gps ?? undefined,
      photos: draft.photos,
      createdAt: now,
      updatedAt: now,
      step: 8,
      totalSteps: 8,
    };
    set({
      surveys: [newSurvey, ...surveys],
      draft: null,
      kpi: { ...kpi, total: kpi.total + 1, today: kpi.today + 1, pending: kpi.pending + 1 },
    });
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
}));

export type { DraftSurvey };
