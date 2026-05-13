import { api } from '@/src/services/api/client';
import type {
  MastersBundle,
  Paginated,
  QcRemarkCreateRequest,
  QcRemarkDto,
  SurveyCreateRequest,
  SurveyDto,
  SurveyListQuery,
  SurveyUpdateRequest,
} from '@/src/types/api';

/* ────────────────────────── Surveys ────────────────────────── */

export const surveyService = {
  list(query: SurveyListQuery = {}): Promise<Paginated<SurveyDto>> {
    return api.get<Paginated<SurveyDto>>('/surveys', { params: query });
  },

  get(id: string): Promise<SurveyDto> {
    return api.get<SurveyDto>(`/surveys/${id}`);
  },

  create(body: SurveyCreateRequest): Promise<SurveyDto> {
    return api.post<SurveyDto, SurveyCreateRequest>('/surveys', body);
  },

  /**
   * Upsert by client-generated `localId`. The server treats this as
   * idempotent — re-sending the same localId returns the existing record.
   */
  upsert(body: SurveyUpdateRequest): Promise<SurveyDto> {
    return api.put<SurveyDto, SurveyUpdateRequest>(`/surveys/by-local/${encodeURIComponent(body.localId)}`, body);
  },

  delete(id: string): Promise<void> {
    return api.delete(`/surveys/${id}`);
  },
};

/* ────────────────────────── Masters ────────────────────────── */

export const mastersService = {
  /**
   * Server returns 304 with empty body when client-known version matches.
   * Use the version hash returned by the previous call as `If-None-Match`.
   */
  async fetch(currentVersion?: string): Promise<MastersBundle | null> {
    try {
      return await api.get<MastersBundle>('/masters', {
        headers: currentVersion ? { 'if-none-match': currentVersion } : undefined,
        validateStatus: (s) => s === 200 || s === 304,
      });
    } catch (err: unknown) {
      // 304 will surface as null from our envelope wrapper if the server returns empty body.
      const status = (err as { status?: number }).status;
      if (status === 304) return null;
      throw err;
    }
  },
};

/* ────────────────────────── QC ────────────────────────── */

export const qcService = {
  list(surveyId: string): Promise<QcRemarkDto[]> {
    return api.get<QcRemarkDto[]>(`/surveys/${surveyId}/qc-remarks`);
  },
  create(body: QcRemarkCreateRequest): Promise<QcRemarkDto> {
    return api.post<QcRemarkDto, QcRemarkCreateRequest>(`/surveys/${body.surveyId}/qc-remarks`, body);
  },
  resolve(surveyId: string, remarkId: string): Promise<QcRemarkDto> {
    return api.patch<QcRemarkDto>(`/surveys/${surveyId}/qc-remarks/${remarkId}`, { status: 'resolved' });
  },
};
