/**
 * Production-grade GPS capture hook.
 *
 * Workflow:
 *   1. Check permission status; request if undetermined.
 *   2. Open settings link if permanently denied.
 *   3. Capture with `BestForNavigation`; retry up to 3 times if accuracy > 30m.
 *   4. Cancellable on screen unmount.
 */
import type { GpsCoord } from '@/src/types';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export type GpsState = 'idle' | 'requesting_permission' | 'denied' | 'capturing' | 'success' | 'error';

interface UseGpsResult {
  state: GpsState;
  coord: GpsCoord | null;
  error: string | null;
  attempts: number;
  capture: () => Promise<GpsCoord | null>;
  reset: () => void;
}

const ACCURACY_THRESHOLD_M = 30;
const MAX_ATTEMPTS = 3;

export function useGps(): UseGpsResult {
  const [state, setState] = useState<GpsState>('idle');
  const [coord, setCoord] = useState<GpsCoord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const cancelled = useRef(false);

  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const capture = useCallback(async (): Promise<GpsCoord | null> => {
    setError(null);
    setState('requesting_permission');

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setState('denied');
      setError('Location permission denied');
      Alert.alert(
        'Location required',
        'Allow location access to capture survey GPS. Open settings to grant permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open settings',
            onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()),
          },
        ],
      );
      return null;
    }

    setState('capturing');
    let best: GpsCoord | null = null;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      if (cancelled.current) return null;
      setAttempts(i + 1);
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        const candidate: GpsCoord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy ?? 9999,
          capturedAt: new Date(pos.timestamp).toISOString(),
        };
        if (!best || candidate.accuracyMeters < best.accuracyMeters) {
          best = candidate;
        }
        if (candidate.accuracyMeters <= ACCURACY_THRESHOLD_M) {
          setCoord(candidate);
          setState('success');
          return candidate;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'GPS failed';
        setError(message);
        setState('error');
        return null;
      }
    }

    // None of the attempts hit the threshold — return our best read.
    if (best) {
      setCoord(best);
      setState('success');
      return best;
    }
    setError('Could not get a GPS fix');
    setState('error');
    return null;
  }, []);

  const reset = useCallback(() => {
    setCoord(null);
    setError(null);
    setAttempts(0);
    setState('idle');
  }, []);

  return { state, coord, error, attempts, capture, reset };
}
