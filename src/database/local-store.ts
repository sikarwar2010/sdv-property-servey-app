/**
 * AsyncStorage-backed survey persistence (replaces WatermelonDB).
 * Works in Expo Go, dev client, and release APK without native SQLite adapters.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredSurvey } from '@/src/database/local-types';

export const LOCAL_SURVEYS_STORAGE_KEY = '@sdv_local_surveys_v1';
export const SCHEMA_VERSION = 1;

let cache: StoredSurvey[] | null = null;
let hydratePromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

let mutationChain = Promise.resolve();

function runMutate<T>(fn: () => Promise<T>): Promise<T> {
  const next = mutationChain.then(fn, fn);
  mutationChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function subscribeLocalSurveys(listener: () => void): () => void {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notify(): void {
  subscribers.forEach((l) => l());
}

export async function ensureLocalSurveysLoaded(): Promise<void> {
  if (cache !== null) return;
  if (hydratePromise) {
    await hydratePromise;
    return;
  }
  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_SURVEYS_STORAGE_KEY);
      if (!raw) {
        cache = [];
        return;
      }
      const parsed = JSON.parse(raw) as StoredSurvey[];
      cache = Array.isArray(parsed) ? parsed : [];
    } catch {
      cache = [];
    } finally {
      hydratePromise = null;
    }
  })();
  await hydratePromise;
}

export function getLocalSurveysSnapshot(): StoredSurvey[] {
  return cache ?? [];
}

export async function persistLocalSurveys(next: StoredSurvey[]): Promise<void> {
  cache = next;
  await AsyncStorage.setItem(LOCAL_SURVEYS_STORAGE_KEY, JSON.stringify(next));
  notify();
}

export async function mutateLocalSurveys(mutator: (draft: StoredSurvey[]) => void): Promise<void> {
  return runMutate(async () => {
    await ensureLocalSurveysLoaded();
    const draft = JSON.parse(JSON.stringify(cache ?? [])) as StoredSurvey[];
    mutator(draft);
    await persistLocalSurveys(draft);
  });
}

/** Clear all local surveys (e.g. logout). */
export async function resetLocalSurveyStore(): Promise<void> {
  await runMutate(async () => {
    cache = [];
    await AsyncStorage.removeItem(LOCAL_SURVEYS_STORAGE_KEY);
    notify();
  });
}
