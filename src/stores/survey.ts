import { kpiData as initialKpi, mockNotifications, mockSurveys, mockSyncQueue } from '@/src/mocks/surveys';
import type { FloorData, GpsCoord, NotificationItem, PhotoRef, SurveyRecord, SyncQueueItem } from '@/src/types';
import { makeId } from '@/src/utils/format';
import { create } from 'zustand';

interface DraftSurvey {
  id: string;
  step: number;
  // Step 1 - Property details
  assessmentYear: string;
  ulbCode: string;
  ulbName: string;
  wardNo: string;
  propertyNo: string;
  isSlum: boolean | null;
  // Step 2 - Owner
  respondentName: string;
  relationship: string;
  family: number;
  mobileNo: string;
  // Step 3 - Address
  houseNo: string;
  streetName: string;
  locality: string;
  city: string;
  pinCode: string;
  // Step 4 - Taxation
  taxRateZone: string;
  ownership: string;
  propertyType: string;
  propertyUse: string;
  roadType: string;
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
  step: 1,
  assessmentYear: '2025-26',
  ulbCode: 'MNP-027',
  ulbName: 'Mathura Nagar Panchayat',
  wardNo: '12',
  propertyNo: '',
  isSlum: false,
  respondentName: '',
  relationship: 'self',
  family: 0,
  mobileNo: '',
  houseNo: '',
  streetName: '',
  locality: '',
  city: 'Mathura',
  pinCode: '',
  taxRateZone: 'A',
  ownership: 'individual',
  propertyType: 'residential',
  propertyUse: 'self',
  roadType: 'pakka_narrow',
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
  saveDraft: () => void;
  cancelDraft: () => void;
  submitSurvey: () => void;
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

  saveDraft: () => {
    // In real app, this writes to WatermelonDB. Here, just log.
    const { draft } = get();
    if (!draft) return;
    // eslint-disable-next-line no-console
    console.log('[draft saved]', draft.id, 'step', draft.step);
  },

  cancelDraft: () => set({ draft: null }),

  submitSurvey: () => {
    const { draft, surveys, kpi } = get();
    if (!draft) return;
    const now = new Date().toISOString();
    const builtUp = draft.floors.reduce((acc, f) => acc + f.areaSqft, 0);
    const newSurvey: SurveyRecord = {
      id: makeId('s'),
      localId: draft.id,
      status: 'pending',
      ownerName: draft.respondentName || 'Untitled',
      propertyNo:
        draft.propertyNo ||
        `PR-${draft.wardNo}-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(5, '0')}`,
      ulbCode: draft.ulbCode,
      ulbName: draft.ulbName,
      wardNo: draft.wardNo,
      addressLine: [draft.houseNo, draft.streetName].filter(Boolean).join(', '),
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
