import { computeKpiFromRows } from '@/src/database/survey-mapper';
import { useSurveysObservable } from '@/src/hooks/use-database';
import type { KpiData } from '@/src/types';
import { useMemo } from 'react';

/** Live KPI counts from local WatermelonDB surveys. */
export function useSurveyKpi(): KpiData {
  const { surveys } = useSurveysObservable();
  return useMemo(() => computeKpiFromRows(surveys), [surveys]);
}
