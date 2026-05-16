/**
 * Local persistence — AsyncStorage JSON (see `local-store.ts`).
 * Clears all cached surveys on logout when wired to `resetLocalSurveyStore`.
 */
export { resetLocalSurveyStore, SCHEMA_VERSION } from '@/src/database/local-store';
