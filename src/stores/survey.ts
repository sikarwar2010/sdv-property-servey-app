import { surveyRepo } from '@/src/database/survey.repo';
import { mockNotifications } from '@/src/mocks/surveys';
import { saveAndSubmitSurvey, type SubmitOutcome } from '@/src/services/survey-submit';
import { useAuthStore } from '@/src/stores/auth';
import type { FloorData, GpsCoord, NotificationItem, PhotoRef } from '@/src/types';
import { makeId } from '@/src/utils/format';
import { create } from 'zustand';

interface DraftSurvey {
  id: string;
  /** Local persisted survey row id (`StoredSurvey.id`); set when starting from New survey. */
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

export type SaveDraftResult =
  | { ok: true }
  | { ok: false; reason: 'no_draft' | 'not_signed_in' | 'db_error'; message?: string };

interface SurveyState {
  notifications: NotificationItem[];
  draft: DraftSurvey | null;
  startDraft: () => void;
  loadDraftFromDb: (wmSurveyId: string) => Promise<void>;
  updateDraft: (patch: Partial<DraftSurvey>) => void;
  addFloor: (floor: Omit<FloorData, 'id'>) => void;
  updateFloor: (id: string, patch: Partial<FloorData>) => void;
  removeFloor: (id: string) => void;
  saveDraft: () => Promise<SaveDraftResult>;
  cancelDraft: () => void;
  submitSurvey: () => Promise<SubmitOutcome>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  notifications: mockNotifications,
  draft: null,

  startDraft: () => {
    set({ draft: emptyDraft() });
    const user = useAuthStore.getState().user;
    if (!user) return;
    void surveyRepo.createDraft(user.id).then((row) => {
      const current = get().draft;
      if (!current) return;
      set({ draft: { ...current, wmSurveyId: row.id, id: row.localId } });
    });
  },

  loadDraftFromDb: async (wmSurveyId) => {
    const draft = await surveyRepo.readWizardDraft(wmSurveyId);
    set({ draft });
  },

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
    let draft = get().draft;
    if (!draft) return { ok: false, reason: 'no_draft' };

    try {
      if (!draft.wmSurveyId) {
        const user = useAuthStore.getState().user;
        if (!user) {
          return { ok: false, reason: 'not_signed_in', message: 'Sign in to save this survey on device.' };
        }
        const row = await surveyRepo.createDraft(user.id);
        set({ draft: { ...draft, wmSurveyId: row.id, id: row.localId } });
        draft = get().draft!;
      }

      await surveyRepo.writeWizardDraft(draft.wmSurveyId!, draft);
      return { ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save draft';
      return { ok: false, reason: 'db_error', message };
    }
  },

  cancelDraft: () => set({ draft: null }),

  submitSurvey: async () => {
    const saveResult = await get().saveDraft();
    if (!saveResult.ok) {
      return { ok: false, message: saveResult.message ?? 'Could not save survey on device' };
    }

    const draft = get().draft;
    if (!draft) {
      return { ok: false, message: 'No survey draft' };
    }

    const outcome = await saveAndSubmitSurvey(draft);
    if (outcome.ok) {
      set({ draft: null });
    }
    return outcome;
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
}));

export type { DraftSurvey };

