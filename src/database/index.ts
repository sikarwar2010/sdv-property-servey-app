/**
 * WatermelonDB singleton.
 *
 * Native module note: requires a development build (NOT Expo Go).
 *   - iOS: pod install after first prebuild.
 *   - Android: requires jsi support, enabled by default in SDK 51 prebuilds.
 *
 * To reset on logout, call `resetDatabase()` — drops and recreates all tables.
 */
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema, SCHEMA_VERSION } from '@/src/database/schema';
import { Floor, MasterEntry, Photo, Survey, SyncQueueItem } from '@/src/database/models';

const adapter = new SQLiteAdapter({
  schema,
  // Bump SCHEMA_VERSION + add a migrations object when changing the schema.
  // migrations: schemaMigrations({ migrations: [] }),
  dbName: 'propertysurvey',
  jsi: true,
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
