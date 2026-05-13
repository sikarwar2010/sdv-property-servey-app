/**
 * Crash & error reporting stub.
 *
 * Swap in Sentry, Bugsnag, or Crashlytics by wiring init in app start and
 * forwarding events from `reportCrash` / `reportBreadcrumb`. The rest of
 * the codebase imports only this module, so changing providers later is
 * a one-file change.
 *
 * Example Sentry wiring:
 *
 *   import * as Sentry from '@sentry/react-native';
 *   Sentry.init({ dsn: env.sentryDsn, ... });
 *   export const reportCrash = (e, ctx) => Sentry.captureException(e, { extra: ctx });
 */

import { env } from '@/src/config/env';

type Context = Record<string, unknown>;

export function reportCrash(error: unknown, context?: Context): void {
  if (!error) return;
  // In dev, log to console so engineers see it.
  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.error('[crash]', error, context);
    return;
  }
  // In production, swallow rather than crash again. Replace with real SDK.
  try {
    // eslint-disable-next-line no-console
    console.warn('[crash]', sanitize(error), context);
  } catch {
    /* never throw from the reporter */
  }
}

export function reportBreadcrumb(message: string, data?: Context): void {
  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.log('[breadcrumb]', message, data);
  }
  // Hook for real SDK here.
}

function sanitize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}
