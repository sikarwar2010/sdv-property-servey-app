import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import type { GpsCoord } from '@/src/types';

interface Props {
  value?: GpsCoord | null;
  onChange: (coord: GpsCoord | null) => void;
}

export function GPSButton({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setError(null);
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      onChange({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy ?? 0,
        capturedAt: new Date(pos.timestamp).toISOString(),
      });
    } catch (e) {
      setError('Could not get location. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Pressable
        onPress={handleCapture}
        disabled={loading}
        className={[
          'flex-row items-center justify-center px-4 py-3.5 rounded-lg border-[1.5px]',
          value ? 'bg-success-soft border-success' : 'bg-brand-soft border-brand',
        ].join(' ')}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#003B8E" />
        ) : (
          <>
            <Ionicons
              name={value ? 'checkmark-circle' : 'location'}
              size={18}
              color={value ? '#16A34A' : '#003B8E'}
            />
            <Text
              className={[
                'ml-2 text-[13px] font-medium',
                value ? 'text-success-ink' : 'text-brand',
              ].join(' ')}
            >
              {value ? 'Coordinates captured' : 'Capture GPS location'}
            </Text>
          </>
        )}
      </Pressable>

      {value ? (
        <View className="mt-2.5 p-3 bg-surface-light dark:bg-surface-dark rounded-lg border border-line-subtle">
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                Latitude
              </Text>
              <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">
                {value.latitude.toFixed(6)}°
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                Longitude
              </Text>
              <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">
                {value.longitude.toFixed(6)}°
              </Text>
            </View>
            <View>
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                Accuracy
              </Text>
              <Text className="text-[13px] font-medium text-success mt-0.5">
                ±{Math.round(value.accuracyMeters)} m
              </Text>
            </View>
          </View>
          <Pressable onPress={() => onChange(null)} hitSlop={8} className="self-end mt-2">
            <Text className="text-caption text-danger font-medium">Clear and recapture</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text className="text-caption text-danger ml-1">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
