/**
 * Save survey locally and push to the Go API when online.
 */
import { surveyRepo } from '@/src/database/survey.repo';
import { useNetworkStore } from '@/src/stores/network';
import type { DraftSurvey } from '@/src/stores/survey';
import { syncEngine } from '@/src/sync/sync-engine';

export type SubmitOutcome =
  | { ok: true; mode: 'synced'; message: string }
  | { ok: true; mode: 'queued'; message: string }
  | { ok: false; message: string };

function isEffectivelyOnline(): boolean {
  const { online, manualOffline } = useNetworkStore.getState();
  return online && !manualOffline;
}

export async function saveAndSubmitSurvey(draft: DraftSurvey): Promise<SubmitOutcome> {
  if (!draft.wmSurveyId) {
    return { ok: false, message: 'Survey not saved on device. Open New survey and tap Continue first.' };
  }

  await surveyRepo.writeWizardDraft(draft.wmSurveyId, draft);
  await surveyRepo.markDirty(draft.wmSurveyId);

  if (!isEffectivelyOnline()) {
    return {
      ok: true,
      mode: 'queued',
      message: 'Saved on this device. Open Sync when you are online to send to the server.',
    };
  }

  const result = await syncEngine.run();
  if (result.error) {
    return {
      ok: false,
      message: result.error,
    };
  }

  return {
    ok: true,
    mode: 'synced',
    message:
      result.pushed > 0
        ? `Sent to server (${result.pushed} survey${result.pushed === 1 ? '' : 's'}).`
        : 'Saved. Server already has the latest copy.',
  };
}
