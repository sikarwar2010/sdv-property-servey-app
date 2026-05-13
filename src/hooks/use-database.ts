/**
 * Live, offline-first WatermelonDB observable hooks.
 *
 * Unlike React Query (server-backed), these subscribe directly to the
 * SQLite layer so the UI updates instantly when local mutations land,
 * with no network round-trip. Use these for the surveys list, draft
 * count, sync queue counters, and any other UI that must reflect the
 * local source of truth in real time.
 */
import { useEffect, useState } from 'react';
import { surveyRepo, floorRepo, photoRepo } from '@/src/database/survey.repo';
import type { Survey, Floor, Photo } from '@/src/database/models';
import type { SurveyStatus } from '@/src/types';

export function useSurveysObservable(filter?: { status?: SurveyStatus; q?: string }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = surveyRepo.observeAll(filter).subscribe({
      next: (rows) => {
        setSurveys(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, [filter?.status, filter?.q]);

  return { surveys, loading };
}

export function useSurveyObservable(id: string | undefined) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const sub = surveyRepo.observeOne(id).subscribe({
      next: (row) => {
        setSurvey(row);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, [id]);

  return { survey, loading };
}

export function useFloorsObservable(surveyId: string | undefined) {
  const [floors, setFloors] = useState<Floor[]>([]);
  useEffect(() => {
    if (!surveyId) return;
    const sub = floorRepo.observeForSurvey(surveyId).subscribe(setFloors);
    return () => sub.unsubscribe();
  }, [surveyId]);
  return floors;
}

export function usePhotosObservable(surveyId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  useEffect(() => {
    if (!surveyId) return;
    const sub = photoRepo.observeForSurvey(surveyId).subscribe(setPhotos);
    return () => sub.unsubscribe();
  }, [surveyId]);
  return photos;
}
