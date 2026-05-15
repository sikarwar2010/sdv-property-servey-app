import { surveyRowToRecord } from '@/src/database/survey-mapper';
import { useSurveysObservable } from '@/src/hooks/use-database';
import type { SurveyRecord, SurveyStatus } from '@/src/types';
import { useEffect, useState } from 'react';

/**
 * Offline-first survey list backed by WatermelonDB.
 * Maps WM rows to `SurveyRecord` for existing UI components.
 */
export function useLocalSurveys(filter?: { status?: SurveyStatus; q?: string }) {
  const { surveys: rows, loading: rowsLoading } = useSurveysObservable(filter);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [mapping, setMapping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMapping(true);
    void (async () => {
      try {
        const mapped = await Promise.all(rows.map((row) => surveyRowToRecord(row)));
        if (!cancelled) setSurveys(mapped);
      } finally {
        if (!cancelled) setMapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rows]);

  return { surveys, loading: rowsLoading || mapping };
}
