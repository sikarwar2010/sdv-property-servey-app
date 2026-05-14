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
import { schema, SCHEMA_VERSION } from '@/src/database/schema';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

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

export const database = new Database({
  adapter,
  modelClasses: [Survey, Floor, Photo, SyncQueueItem, MasterEntry],
});

export async function resetDatabase(): Promise<void> {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}

export { SCHEMA_VERSION };
