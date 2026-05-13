/**
 * Centralised query keys. Always use these — never inline strings.
 * Hierarchical structure lets `invalidateQueries({ queryKey: surveyKeys.all })`
 * blow away every survey-related cache in one call.
 */
import type { SurveyListQuery } from '@/src/types/api';

export const surveyKeys = {
  all: ['surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (query: SurveyListQuery) => [...surveyKeys.lists(), query] as const,
  details: () => [...surveyKeys.all, 'detail'] as const,
  detail: (id: string) => [...surveyKeys.details(), id] as const,
} as const;

export const mastersKeys = {
  all: ['masters'] as const,
  bundle: () => [...mastersKeys.all, 'bundle'] as const,
} as const;

export const qcKeys = {
  all: ['qc'] as const,
  forSurvey: (surveyId: string) => [...qcKeys.all, surveyId] as const,
} as const;

export const authKeys = {
  me: ['auth', 'me'] as const,
} as const;
