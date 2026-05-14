import type { GpsCoord } from '@/src/types';
import type { LocationObject } from 'expo-location';
import * as ExpoLocation from 'expo-location';
import { Platform } from 'react-native';

/**
 * Maximum horizontal uncertainty (OS-reported 68% / typical radius, meters) accepted for GIS step.
 * True ±1 m needs RTK/survey gear; phones in open sky are often ~3–8 m at best.
 */
export const GPS_MAX_ACCURACY_METERS = 10;

/** Stop sampling early when the OS reports uncertainty at or below this (saves time when sky is clear). */
export const GPS_IDEAL_ACCURACY_METERS = 5;

const WATCH_BUDGET_MS = 28_000;
const POLL_MS = 400;

const watchOptions = {
  accuracy: ExpoLocation.Accuracy.BestForNavigation,
  timeInterval: 500,
  distanceInterval: 0,
  mayShowUserSettingsDialog: true,
};

function locationToCoord(loc: LocationObject): GpsCoord | null {
  if (loc.mocked) return null;
  const acc = loc.coords.accuracy;
  if (acc == null || !Number.isFinite(acc) || acc <= 0) return null;
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracyMeters: acc,
    capturedAt: new Date(loc.timestamp).toISOString(),
  };
}

function pickBetter(a: GpsCoord | null, b: GpsCoord | null): GpsCoord | null {
  if (!a) return b;
  if (!b) return a;
  return b.accuracyMeters < a.accuracyMeters ? b : a;
}

/**
 * Waits for GNSS/network fusion to refine: keeps the fix with the smallest reported uncertainty.
 * Android: prompts for high-accuracy mode when needed (Wi‑Fi + cell + GPS).
 */
export async function captureBestGpsCoord(): Promise<GpsCoord> {
  const enabled = await ExpoLocation.hasServicesEnabledAsync();
  if (!enabled) {
    throw new Error('Location is off. Turn on GPS/location in device settings.');
  }

  if (Platform.OS === 'android') {
    try {
      await ExpoLocation.enableNetworkProviderAsync();
    } catch {
      /* user declined system dialog — still try GPS-only */
    }
  }

  const bestRef: { current: GpsCoord | null } = { current: null };
  const consider = (loc: LocationObject) => {
    const c = locationToCoord(loc);
    if (c) bestRef.current = pickBetter(bestRef.current, c);
  };

  const sub = await ExpoLocation.watchPositionAsync(watchOptions, consider, () => undefined);

  const deadline = Date.now() + WATCH_BUDGET_MS;
  try {
    while (Date.now() < deadline) {
      const candidate = bestRef.current;
      if (candidate !== null && candidate.accuracyMeters <= GPS_IDEAL_ACCURACY_METERS) break;
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  } finally {
    sub.remove();
  }

  if (bestRef.current) return bestRef.current;

  const pos = await ExpoLocation.getCurrentPositionAsync(watchOptions);
  const fallback = locationToCoord(pos);
  if (fallback) return fallback;

  throw new Error('Could not read a valid GPS accuracy. Move outdoors with a clear sky view and try again.');
}
