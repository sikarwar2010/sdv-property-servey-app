/**
 * Production-grade GPS capture hook.
 *
 * Workflow:
 *   1. Request foreground permission; offer settings if denied.
 *   2. Delegate to `captureBestGpsCoord` (BestForNavigation watch + Android high-accuracy mode).
 *   3. Cancellable on screen unmount (in-flight result still applied if already resolved).
 */
import { captureBestGpsCoord } from '@/src/services/gps/capture-best-fix';
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
    setAttempts(1);
    if (cancelled.current) return null;
    try {
      const result = await captureBestGpsCoord();
      if (cancelled.current) return null;
      setCoord(result);
      setState('success');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GPS failed';
      setError(message);
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setCoord(null);
    setError(null);
    setAttempts(0);
    setState('idle');
  }, []);

  return { state, coord, error, attempts, capture, reset };
}
