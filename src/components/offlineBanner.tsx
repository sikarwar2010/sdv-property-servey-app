import { useIsOnline, useNetworkStore } from '@/src/stores/network';
import { timeAgo } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function OfflineBanner() {
  const online = useIsOnline();
  const lastSyncAt = useNetworkStore((s) => s.lastSyncAt);
  const translate = useSharedValue(online ? -60 : 0);
  const opacity = useSharedValue(online ? 0 : 1);

  useEffect(() => {
    translate.value = withTiming(online ? -60 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(online ? 0 : 1, { duration: 200 });
  }, [online, translate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View className="flex-row items-center px-3.5 py-2 bg-warning" style={animatedStyle}>
      <Ionicons name="cloud-offline" size={14} color="#FFFFFF" />
      <Text className="flex-1 ml-2 text-helper font-medium text-white">You're offline</Text>
      <Text className="text-caption text-white/90">Last sync {timeAgo(lastSyncAt)}</Text>
    </Animated.View>
  );
}
