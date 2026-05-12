import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AppButton } from './AppButton';

/* =========================================================================
   Skeleton + SkeletonCard
   ========================================================================= */
interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  className?: string;
}
export function Skeleton({ width = '100%', height = 14, borderRadius = 6, className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      className={['bg-line-subtle', className].join(' ')}
      style={[{ width: width as any, height, borderRadius }, animated]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View className="p-3.5 mb-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle">
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Skeleton width="70%" height={14} />
          <Skeleton width="90%" height={11} className="mt-1.5" />
          <Skeleton width="55%" height={10} className="mt-2" />
        </View>
        <Skeleton width={56} height={18} borderRadius={999} />
      </View>
    </View>
  );
}

/* =========================================================================
   EmptyState
   ========================================================================= */
interface EmptyProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({ icon = 'clipboard-outline', title, message, actionLabel, onAction }: EmptyProps) {
  return (
    <View className="items-center justify-center py-8 px-6">
      <View className="w-16 h-16 rounded-full bg-brand-soft items-center justify-center">
        <Ionicons name={icon} size={30} color="#003B8E" />
      </View>
      <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark mt-3.5">{title}</Text>
      {message ? (
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 text-center">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} iconLeft="add" onPress={onAction} className="mt-4 px-6" />
      ) : null}
    </View>
  );
}

/* =========================================================================
   ErrorState
   ========================================================================= */
interface ErrorProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
}
export function ErrorState({ title, message, onRetry, onSecondary, secondaryLabel }: ErrorProps) {
  return (
    <View className="items-center justify-center py-8 px-6">
      <View className="w-16 h-16 rounded-full bg-danger-soft items-center justify-center">
        <Ionicons name="cloud-offline" size={30} color="#DC2626" />
      </View>
      <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark mt-3.5">{title}</Text>
      {message ? (
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1 text-center">
          {message}
        </Text>
      ) : null}
      <View className="flex-row gap-2 mt-4">
        {onSecondary && secondaryLabel ? (
          <AppButton label={secondaryLabel} variant="outline" onPress={onSecondary} size="md" />
        ) : null}
        {onRetry ? <AppButton label="Retry" iconLeft="refresh" onPress={onRetry} size="md" /> : null}
      </View>
    </View>
  );
}

/* =========================================================================
   Toast
   ========================================================================= */
type ToastTone = 'success' | 'danger' | 'info';
interface ToastProps {
  visible: boolean;
  title: string;
  message?: string;
  tone?: ToastTone;
  onHide?: () => void;
}
export function Toast({ visible, title, message, tone = 'info', onHide }: ToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 220 });
      opacity.value = withTiming(1, { duration: 200 });
      const t = setTimeout(() => {
        translateY.value = withTiming(80, { duration: 220 });
        opacity.value = withTiming(0, { duration: 200 });
        if (onHide) setTimeout(onHide, 240);
      }, 2400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible, translateY, opacity, onHide]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const toneClass: Record<ToastTone, string> = {
    success: 'bg-success',
    danger: 'bg-danger',
    info: 'bg-brand',
  };
  const iconMap: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle',
    danger: 'alert-circle',
    info: 'information-circle',
  };

  if (!visible) return null;
  return (
    <Animated.View
      pointerEvents="none"
      className={[
        'absolute left-4 right-4 bottom-6 px-3.5 py-3 flex-row items-center rounded-xl',
        toneClass[tone],
      ].join(' ')}
      style={animated}
    >
      <Ionicons name={iconMap[tone]} size={18} color="#FFFFFF" />
      <View className="flex-1 ml-2.5">
        <Text className="text-helper font-medium text-white">{title}</Text>
        {message ? <Text className="text-caption text-white/90">{message}</Text> : null}
      </View>
    </Animated.View>
  );
}

/* =========================================================================
   KpiCard
   ========================================================================= */
interface KpiProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: number | string;
  label: string;
}
export function KpiCard({ icon, iconColor, value, label }: KpiProps) {
  return (
    <View className="p-2.5 bg-surface-light dark:bg-surface-dark rounded-lg border border-line-subtle items-start">
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">{value}</Text>
      <Text numberOfLines={1} className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
        {label}
      </Text>
    </View>
  );
}

/* =========================================================================
   FloatingSaveButton
   ========================================================================= */
interface FabProps {
  label?: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}
export function FloatingSaveButton({ label = 'Save draft', onPress, icon = 'save-outline' }: FabProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View className="absolute right-4 bottom-6" style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withTiming(0.96, { duration: 80 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        className="flex-row items-center px-5 py-3.5 rounded-full bg-brand active:bg-brand-strong"
        style={{
          shadowColor: '#003B8E',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Ionicons name={icon} size={18} color="#FFFFFF" />
        <Text className="ml-2 text-[13px] font-medium text-white">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* =========================================================================
   SyncIndicator
   ========================================================================= */
interface SyncIndicatorProps {
  state: 'idle' | 'syncing' | 'success' | 'failed';
  message?: string;
}
export function SyncIndicator({ state, message }: SyncIndicatorProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (state === 'syncing') {
      rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = withTiming(0);
    }
  }, [state, rotation]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const cfg = {
    idle: { icon: 'cloud-outline' as const, color: '#64748B', textClass: 'text-ink-tertiary-light', label: 'Idle' },
    syncing: { icon: 'sync-outline' as const, color: '#003B8E', textClass: 'text-brand', label: 'Uploading…' },
    success: { icon: 'checkmark-circle' as const, color: '#16A34A', textClass: 'text-success', label: 'Uploaded' },
    failed: { icon: 'cloud-offline' as const, color: '#DC2626', textClass: 'text-danger', label: 'Failed · retry' },
  }[state];

  return (
    <View className="flex-row items-center">
      <Animated.View style={state === 'syncing' ? spinStyle : undefined}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      </Animated.View>
      <Text className={['ml-1.5 text-helper font-medium', cfg.textClass].join(' ')}>{message ?? cfg.label}</Text>
    </View>
  );
}
