import { surveyRowToRecord } from '@/src/database/survey-mapper';
import { useSurveysObservable } from '@/src/hooks/use-database';
import type { SurveyRecord, SurveyStatus } from '@/src/types';
import { useMemo } from 'react';

/**
 * Offline-first survey list backed by local JSON (AsyncStorage).
 * Maps stored rows to `SurveyRecord` for existing UI components.
 */
export function useLocalSurveys(filter?: { status?: SurveyStatus; q?: string }) {
  const { surveys: rows, loading: rowsLoading } = useSurveysObservable(filter);
  const surveys = useMemo(() => rows.map((row) => surveyRowToRecord(row)), [rows]);
  return { surveys, loading: rowsLoading };
}
