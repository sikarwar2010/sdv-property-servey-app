import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mastersService } from '@/src/services/surveys/survey.service';
import { surveyService } from '@/src/services/surveys/survey.service';
import { mastersKeys, surveyKeys } from '@/src/lib/query-keys';
import { syncEngine } from '@/src/sync/sync-engine';
import { surveyRepo } from '@/src/database/survey.repo';
import type {
  MastersBundle,
  Paginated,
  SurveyDto,
  SurveyListQuery,
  SurveyUpdateRequest,
} from '@/src/types/api';

/* ────────────────────────── Masters ────────────────────────── */

export function useMasters() {
  return useQuery<MastersBundle | null>({
    queryKey: mastersKeys.bundle(),
    queryFn: () => mastersService.fetch(),
    staleTime: 60 * 60 * 1000, // 1 hr — masters change rarely
  });
}

/* ────────────────────────── Surveys (server-side list) ────────────────────────── */

/**
 * Server-backed paginated list. For the field surveyor offline-first UI,
 * prefer `useLocalSurveys` / `useSurveysObservable` — this hook is for
 * supervisor / admin views.
 */
export function useSurveysQuery(query: SurveyListQuery = {}) {
  return useQuery<Paginated<SurveyDto>>({
    queryKey: surveyKeys.list(query),
    queryFn: () => surveyService.list(query),
  });
}

export function useSurveyQuery(id: string | undefined) {
  return useQuery<SurveyDto>({
    queryKey: id ? surveyKeys.detail(id) : surveyKeys.detail('unknown'),
    queryFn: () => surveyService.get(id!),
    enabled: !!id,
  });
}

/**
 * Submits a survey draft. Offline-first: writes locally, marks dirty,
 * then triggers the sync engine. The mutation resolves once the local
 * write completes; server confirmation arrives asynchronously via sync.
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (surveyId: string) => {
      await surveyRepo.markDirty(surveyId);
      // Don't await sync — fire-and-forget so the UI can move on.
      void syncEngine.run();
      return { surveyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

/**
 * Optimistic upsert when editing. Not used for first-time creation
 * (which goes through the wizard + repo directly).
 */
export function useUpsertSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SurveyUpdateRequest) => surveyService.upsert(body),
    onSuccess: (data) => {
      queryClient.setQueryData(surveyKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}
