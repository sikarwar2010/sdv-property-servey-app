import type { GpsCoord, PhotoRef } from '@/src/types';
import type { PropertyAddressForMap } from '@/src/utils/property-geocode';
import { Image, Text, View } from 'react-native';
import { GisSatelliteMap } from './GisSatelliteMap';

interface Props {
  photos: PhotoRef[];
  capturedGps?: GpsCoord | null;
  /** Step 3 address — geocoded on map with H.No (see `GisSatelliteMap`). */
  addressContext?: PropertyAddressForMap | null;
}

function ThumbPlaceholder({ label }: { label: string }) {
  return (
    <View className="w-full rounded-md border border-dashed border-line-subtle bg-surface-light dark:bg-surface-dark items-center justify-center h-[84px]">
      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
    </View>
  );
}

/**
 * Demand-notice style row: property thumbnails (front / side) beside satellite GIS map.
 */
export function PropertyPhotosGisNoticeRow({ photos, capturedGps, addressContext }: Props) {
  const front = photos.find((p) => p.slot === 'front');
  const side = photos.find((p) => p.slot === 'side');

  return (
    <View className="flex-row gap-2.5">
      <View className="flex-1 min-w-0">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary-light dark:text-ink-tertiary-dark mb-1.5">
          Property photos
        </Text>
        <View className="gap-1.5">
          {front ? (
            <Image
              source={{ uri: front.localUri }}
              className="w-full rounded-md bg-black/10"
              style={{ height: 84 }}
              resizeMode="cover"
              accessibilityLabel="Front property photo"
            />
          ) : (
            <ThumbPlaceholder label="Front (required)" />
          )}
          {side ? (
            <Image
              source={{ uri: side.localUri }}
              className="w-full rounded-md bg-black/10"
              style={{ height: 84 }}
              resizeMode="cover"
              accessibilityLabel="Side property photo"
            />
          ) : (
            <ThumbPlaceholder label="Side (optional)" />
          )}
        </View>
      </View>

      <View className="w-[47%] max-w-[200px] min-w-[128px]">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary-light dark:text-ink-tertiary-dark mb-1.5">
          GIS Map (Satellite View)
        </Text>
        <GisSatelliteMap
          capturedGps={capturedGps}
          addressContext={addressContext}
          variant="compact"
          markerColor="notice"
          containerClassName="mt-0"
        />
      </View>
    </View>
  );
}
