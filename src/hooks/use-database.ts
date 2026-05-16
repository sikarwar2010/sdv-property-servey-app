/**
 * Live local survey hooks — subscribe to AsyncStorage-backed store updates.
 */
import { surveyRepo, floorRepo, photoRepo } from '@/src/database/survey.repo';
import type { StoredFloor, StoredPhoto, StoredSurvey } from '@/src/database/local-types';
import type { SurveyStatus } from '@/src/types';
import { useEffect, useState } from 'react';

export function useSurveysObservable(filter?: { status?: SurveyStatus; q?: string }) {
  const [surveys, setSurveys] = useState<StoredSurvey[]>([]);
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
  const [survey, setSurvey] = useState<StoredSurvey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setSurvey(null);
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
  const [floors, setFloors] = useState<StoredFloor[]>([]);
  useEffect(() => {
    if (!surveyId) return;
    const sub = floorRepo.observeForSurvey(surveyId).subscribe({ next: setFloors });
    return () => sub.unsubscribe();
  }, [surveyId]);
  return floors;
}

export function usePhotosObservable(surveyId: string | undefined) {
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  useEffect(() => {
    if (!surveyId) return;
    const sub = photoRepo.observeForSurvey(surveyId).subscribe({ next: setPhotos });
    return () => sub.unsubscribe();
  }, [surveyId]);
  return photos;
}
