import type { GpsCoord } from '@/src/types';
import { buildPropertyGeocodeQuery, type PropertyAddressForMap } from '@/src/utils/property-geocode';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

const INDIA_OVERVIEW: Region = {
  latitude: 22.9734,
  longitude: 78.6569,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

const DEFAULT_ZOOM_DELTA = 0.0009;

function regionAround(
  lat: number,
  lng: number,
  latitudeDelta: number = DEFAULT_ZOOM_DELTA,
  longitudeDelta: number = DEFAULT_ZOOM_DELTA,
): Region {
  return { latitude: lat, longitude: lng, latitudeDelta, longitudeDelta };
}

const NOTICE_MARKER = {
  pin: 'red' as const,
  stroke: 'rgba(220, 38, 38, 0.6)',
  fill: 'rgba(220, 38, 38, 0.14)',
};

const BRAND_MARKER = {
  pin: 'blue' as const,
  stroke: 'rgba(0, 59, 142, 0.55)',
  fill: 'rgba(0, 59, 142, 0.14)',
};

const ADDRESS_MARKER = {
  pin: 'green' as const,
};

interface Props {
  /** When set, map centers here and draws marker + accuracy circle. */
  capturedGps?: GpsCoord | null;
  /** Address from step 3 — geocoded to show approximate property location (H.No on map). */
  addressContext?: PropertyAddressForMap | null;
  /** Default: full-height block in wizard; compact: demand-notice style beside photos. */
  variant?: 'default' | 'compact';
  /** `notice` = red pin like printed demand notice; `brand` = blue pin. */
  markerColor?: 'notice' | 'brand';
  /** Extra classes on the map frame (e.g. `mt-0` when nested in a notice row). */
  containerClassName?: string;
}

/**
 * Embedded satellite map for the GIS step: Google Maps on Android (SDK key), Apple Maps on iOS.
 * Shows geocoded address (house no.) when GPS not yet captured; survey GPS + accuracy when captured.
 */
export function GisSatelliteMap({
  capturedGps,
  addressContext,
  variant = 'default',
  markerColor = 'notice',
  containerClassName = '',
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [addressPin, setAddressPin] = useState<{ latitude: number; longitude: number } | null>(null);

  const geocodeQuery = useMemo(
    () => (addressContext ? buildPropertyGeocodeQuery(addressContext) : null),
    [
      addressContext?.houseNo,
      addressContext?.streetName,
      addressContext?.locality,
      addressContext?.colony,
      addressContext?.city,
      addressContext?.pinCode,
      addressContext?.wardNo,
      addressContext?.ulbName,
    ],
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (capturedGps) {
      setAddressPin(null);
      return;
    }
    if (!geocodeQuery) {
      setAddressPin(null);
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== 'granted' || cancelled) return;
          const results = await Location.geocodeAsync(geocodeQuery);
          if (cancelled || !results[0]) {
            if (!cancelled) setAddressPin(null);
            return;
          }
          const first = results[0];
          setAddressPin({ latitude: first.latitude, longitude: first.longitude });
        } catch {
          if (!cancelled) setAddressPin(null);
        }
      })();
    }, 550);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [geocodeQuery, capturedGps]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!mapRef.current) return;

    if (capturedGps) {
      mapRef.current.animateToRegion(regionAround(capturedGps.latitude, capturedGps.longitude), 450);
      return;
    }

    if (addressPin) {
      mapRef.current.animateToRegion(regionAround(addressPin.latitude, addressPin.longitude, 0.012, 0.012), 400);
      return;
    }

    let cancelled = false;
    void (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled || !mapRef.current) return;
      const last = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
      if (cancelled || !last || !mapRef.current) return;
      mapRef.current.animateToRegion(regionAround(last.coords.latitude, last.coords.longitude, 0.02, 0.02), 300);
    })();

    return () => {
      cancelled = true;
    };
  }, [capturedGps, addressPin]);

  const mapHeight = variant === 'compact' ? 168 : 220;
  const palette = markerColor === 'notice' ? NOTICE_MARKER : BRAND_MARKER;
  const frameClass = [
    'overflow-hidden rounded-lg border border-line-subtle',
    variant === 'default' ? 'mt-2' : '',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const houseLabel = addressContext?.houseNo?.trim() || '—';

  const openInMaps = () => {
    if (capturedGps) {
      const q = `${capturedGps.latitude},${capturedGps.longitude}`;
      void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
      return;
    }
    if (geocodeQuery) {
      void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(geocodeQuery)}`);
      return;
    }
    if (addressPin) {
      const q = `${addressPin.latitude},${addressPin.longitude}`;
      void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
    }
  };

  const canOpenMaps = Boolean(capturedGps || geocodeQuery || addressPin);
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  if (Platform.OS === 'web') {
    return (
      <View
        className={[
          'rounded-xl border border-line-subtle bg-surface-light dark:bg-surface-dark p-4',
          variant === 'default' ? 'mt-2' : '',
          containerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Text className="text-caption text-ink-secondary-light dark:text-ink-secondary-dark">
          Satellite map is available in the iOS and Android apps.
        </Text>
      </View>
    );
  }

  const coordBanner = capturedGps
    ? `H.No ${houseLabel} · Survey ${capturedGps.latitude.toFixed(5)}°, ${capturedGps.longitude.toFixed(5)}° (±${Math.round(capturedGps.accuracyMeters)} m)`
    : addressPin
      ? `H.No ${houseLabel} · Address ${addressPin.latitude.toFixed(5)}°, ${addressPin.longitude.toFixed(5)}° (approx.)`
      : null;

  return (
    <View className={frameClass} style={{ height: mapHeight }}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={{ flex: 1 }}
        mapType="satellite"
        initialRegion={INDIA_OVERVIEW}
        showsUserLocation
        showsMyLocationButton={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={false}
        zoomTapEnabled
        zoomEnabled
        loadingEnabled
        loadingIndicatorColor="#003B8E"
      >
        {addressPin && !capturedGps ? (
          <Marker
            coordinate={addressPin}
            title={`Property (H.No ${houseLabel})`}
            description="From address search"
            pinColor={ADDRESS_MARKER.pin}
          />
        ) : null}
        {capturedGps ? (
          <>
            <Marker
              coordinate={{ latitude: capturedGps.latitude, longitude: capturedGps.longitude }}
              title={`Survey GPS · H.No ${houseLabel}`}
              description={`±${Math.round(capturedGps.accuracyMeters)} m`}
              pinColor={palette.pin}
            />
            <Circle
              center={{ latitude: capturedGps.latitude, longitude: capturedGps.longitude }}
              radius={Math.max(capturedGps.accuracyMeters, 3)}
              strokeColor={palette.stroke}
              fillColor={palette.fill}
            />
          </>
        ) : null}
      </MapView>
      {canOpenMaps ? (
        <Pressable
          onPress={openInMaps}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open in Google Maps"
          className="absolute top-1.5 right-1.5 w-8 h-8 rounded-md bg-white/92 items-center justify-center border border-black/10"
        >
          <Ionicons name="expand-outline" size={18} color="#111827" />
        </Pressable>
      ) : null}
      {coordBanner ? (
        <View className="absolute top-1.5 left-1.5 right-12 pointer-events-none">
          <Text
            className="text-[9px] text-white font-medium bg-black/60 px-1.5 py-1 rounded max-h-[36px]"
            numberOfLines={2}
          >
            {coordBanner}
          </Text>
        </View>
      ) : null}
      {!capturedGps ? (
        <View className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <Text className="text-[11px] text-white font-medium bg-black/55 px-2 py-1 rounded self-start">
            {addressPin
              ? 'Green = address from H.No · capture GPS for red survey pin'
              : 'Fill city + 6-digit PIN (step 3) to plot H.No on map · blue dot = you'}
          </Text>
        </View>
      ) : (
        <View className="absolute bottom-1 left-1 right-10 pointer-events-none">
          <Text className="text-[9px] text-white/90 bg-black/45 px-1.5 py-0.5 rounded self-start">
            Android uses Google Maps SDK · verify on site
          </Text>
        </View>
      )}
    </View>
  );
}
