/**
 * Background sync task.
 *
 * Wires `expo-background-fetch` + `expo-task-manager` so the sync engine
 * runs roughly every 15 minutes while the app is backgrounded (subject to
 * OS throttling — iOS especially is aggressive). The task is also reused
 * by foreground triggers via syncEngine.run().
 *
 * Lifecycle:
 *   1. App start → registerBackgroundSync() in root layout if user is signed in
 *   2. OS wakes the app every ~15 min → task runs syncEngine.run()
 *   3. On logout → unregisterBackgroundSync()
 *
 * iOS gotchas:
 *   - Add "fetch" and "processing" to UIBackgroundModes in Info.plist
 *     (already in our app.json).
 *   - Users must keep "Background App Refresh" enabled in Settings.
 *   - The OS decides when to actually run the task — there's no guarantee.
 *
 * Android: works reliably as long as battery optimization isn't aggressive.
 */
import { tokenStorage } from '@/src/services/auth/token-storage';
import { syncEngine } from '@/src/sync/sync-engine';
import { reportBreadcrumb, reportCrash } from '@/src/utils/crash';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const TASK_NAME = 'property-survey-background-sync';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Don't sync if there's no auth — app might be backgrounded post-logout.
    const tokens = await tokenStorage.load();
    if (!tokens || tokenStorage.refreshIsExpired(tokens)) {
      reportBreadcrumb('bg-sync skipped: no valid auth');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const result = await syncEngine.run();
    reportBreadcrumb('bg-sync result', {
      pushed: result.pushed,
      pulled: result.pulled,
      failed: result.failed,
    });
    return result.pushed + result.pulled > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (err) {
    reportCrash(err, { source: 'bg-sync' });
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      reportBreadcrumb('bg-sync unavailable on this device');
      return;
    }
    const already = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (already) return;
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 15 * 60, // seconds; iOS treats this as a hint
      stopOnTerminate: false,
      startOnBoot: true,
    });
    reportBreadcrumb('bg-sync registered');
  } catch (err) {
    reportCrash(err, { source: 'registerBackgroundSync' });
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (registered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      reportBreadcrumb('bg-sync unregistered');
    }
  } catch (err) {
    reportCrash(err, { source: 'unregisterBackgroundSync' });
  }
}
