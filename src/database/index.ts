/**
 * WatermelonDB singleton.
 *
 * Native module: WatermelonDB is not included in Expo Go. Use a dev client and rebuild native
 * after config changes (`plugins/withWatermelonNative` registers the Android package and iOS simdjson):
 *   bun run prebuild
 *   bun run dev:android   # or dev:ios
 * Keep `jsi: false` unless you have verified JSI (see WatermelonDB issues on New Architecture).
 *
 * To reset on logout, call `resetDatabase()` — drops and recreates all tables.
 */
import { Floor, MasterEntry, Photo, Survey, SyncQueueItem } from '@/src/database/models';
import { assertWatermelonNative } from '@/src/database/native';
import { schema, SCHEMA_VERSION } from '@/src/database/schema';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

let databaseSingleton: Database | null = null;

function getDatabase(): Database {
  if (databaseSingleton) return databaseSingleton;

  assertWatermelonNative();

  const adapter = new SQLiteAdapter({
    schema,
    // Bump SCHEMA_VERSION + add a migrations object when changing the schema.
    // migrations: schemaMigrations({ migrations: [] }),
    dbName: 'propertysurvey',
    jsi: false,
    onSetUpError: (error) => {
      console.error('[db] setup error', error);
    },
  });

  databaseSingleton = new Database({
    adapter,
    modelClasses: [Survey, Floor, Photo, SyncQueueItem, MasterEntry],
  });

  return databaseSingleton;
}

/** Lazy singleton — avoids crashing at import time when the native module is missing. */
export const database = new Proxy({} as Database, {
  get(_target, prop) {
    const db = getDatabase();
    const value = db[prop as keyof Database];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(db) : value;
  },
});

export async function resetDatabase(): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    await db.unsafeResetDatabase();
  });
}

export { SCHEMA_VERSION };
