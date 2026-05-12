import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AppButton } from './AppButton';

/* =========================================================================
   RadioGroup - explicit single choice with radio dots
   ========================================================================= */
interface RadioItem<T extends string> {
  value: T;
  label: string;
  helper?: string;
}
interface RadioGroupProps<T extends string> {
  items: ReadonlyArray<RadioItem<T>>;
  value: T;
  onChange: (v: T) => void;
}

export function RadioGroup<T extends string>({ items, value, onChange }: RadioGroupProps<T>) {
  return (
    <View className="gap-2">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            className={[
              'flex-row items-start p-3 rounded-lg border',
              active ? 'bg-brand-soft border-brand' : 'bg-surface-light dark:bg-surface-dark border-line-subtle',
            ].join(' ')}
          >
            <View
              className={[
                'w-5 h-5 rounded-full border-2 items-center justify-center mr-2.5',
                active ? 'border-brand' : 'border-line-default',
              ].join(' ')}
            >
              {active ? <View className="w-2.5 h-2.5 rounded-full bg-brand" /> : null}
            </View>
            <View className="flex-1">
              <Text
                className={[
                  'text-[13px]',
                  active ? 'text-brand font-medium' : 'text-ink-primary-light dark:text-ink-primary-dark',
                ].join(' ')}
              >
                {item.label}
              </Text>
              {item.helper ? (
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                  {item.helper}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/* =========================================================================
   CheckboxGroup - multi-select with checkbox squares
   ========================================================================= */
interface CheckboxItem<T extends string> {
  value: T;
  label: string;
  helper?: string;
}
interface CheckboxGroupProps<T extends string> {
  items: ReadonlyArray<CheckboxItem<T>>;
  values: T[];
  onChange: (values: T[]) => void;
}

export function CheckboxGroup<T extends string>({ items, values, onChange }: CheckboxGroupProps<T>) {
  const toggle = (v: T) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <View className="gap-2">
      {items.map((item) => {
        const active = values.includes(item.value);
        return (
          <Pressable
            key={item.value}
            onPress={() => toggle(item.value)}
            className={[
              'flex-row items-start p-3 rounded-lg border',
              active ? 'bg-brand-soft border-brand' : 'bg-surface-light dark:bg-surface-dark border-line-subtle',
            ].join(' ')}
          >
            <View
              className={[
                'w-5 h-5 rounded border-2 items-center justify-center mr-2.5',
                active ? 'border-brand bg-brand' : 'border-line-default bg-transparent',
              ].join(' ')}
            >
              {active ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
            </View>
            <View className="flex-1">
              <Text
                className={[
                  'text-[13px]',
                  active ? 'text-brand font-medium' : 'text-ink-primary-light dark:text-ink-primary-dark',
                ].join(' ')}
              >
                {item.label}
              </Text>
              {item.helper ? (
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                  {item.helper}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/* =========================================================================
   Banner - inline info / success / warning / danger callout
   ========================================================================= */
type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'brand';
interface BannerProps {
  tone?: BannerTone;
  title?: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function Banner({ tone = 'info', title, message, icon, onClose, actionLabel, onAction }: BannerProps) {
  const cfg = {
    info: {
      bg: 'bg-info-soft',
      border: 'border-info/30',
      ink: 'text-info-ink',
      iconColor: '#1E40AF',
      defaultIcon: 'information-circle' as const,
    },
    success: {
      bg: 'bg-success-soft',
      border: 'border-success/30',
      ink: 'text-success-ink',
      iconColor: '#166534',
      defaultIcon: 'checkmark-circle' as const,
    },
    warning: {
      bg: 'bg-warning-soft',
      border: 'border-warning/30',
      ink: 'text-warning-ink',
      iconColor: '#92400E',
      defaultIcon: 'alert-circle' as const,
    },
    danger: {
      bg: 'bg-danger-soft',
      border: 'border-danger/30',
      ink: 'text-danger-ink',
      iconColor: '#991B1B',
      defaultIcon: 'alert-circle' as const,
    },
    brand: {
      bg: 'bg-brand-soft',
      border: 'border-brand/20',
      ink: 'text-brand',
      iconColor: '#003B8E',
      defaultIcon: 'information-circle' as const,
    },
  }[tone];
  return (
    <View className={[cfg.bg, cfg.border, 'border rounded-xl p-3 flex-row items-start'].join(' ')}>
      <Ionicons name={icon ?? cfg.defaultIcon} size={16} color={cfg.iconColor} />
      <View className="flex-1 ml-2">
        {title ? <Text className={[cfg.ink, 'text-helper font-medium'].join(' ')}>{title}</Text> : null}
        <Text className={[cfg.ink, 'text-caption'].join(' ')}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={4} className="mt-1.5 self-start">
            <Text className={[cfg.ink, 'text-caption font-medium underline'].join(' ')}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={14} color={cfg.iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* =========================================================================
   Divider - horizontal line with optional label
   ========================================================================= */
export function Divider({ label }: { label?: string }) {
  if (!label) return <View className="h-px bg-line-subtle my-3" />;
  return (
    <View className="flex-row items-center my-3">
      <View className="flex-1 h-px bg-line-subtle" />
      <Text className="px-2 text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
      <View className="flex-1 h-px bg-line-subtle" />
    </View>
  );
}

/* =========================================================================
   Avatar - circular initials or icon
   ========================================================================= */
interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: keyof typeof Ionicons.glyphMap;
}
export function Avatar({ name = '?', size = 'md', tone = 'brand', icon }: AvatarProps) {
  const sizeClass = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-[60px] h-[60px]',
  }[size];
  const textSize = { sm: 'text-[10px]', md: 'text-[13px]', lg: 'text-h3', xl: 'text-2xl' }[size];
  const toneClass = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-ink-secondary-light',
  }[tone];
  const iconSize = { sm: 14, md: 18, lg: 24, xl: 28 }[size];

  return (
    <View className={[sizeClass, toneClass, 'rounded-full items-center justify-center'].join(' ')}>
      {icon ? (
        <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
      ) : (
        <Text className={[textSize, 'font-medium text-white'].join(' ')}>{name.slice(0, 2).toUpperCase()}</Text>
      )}
    </View>
  );
}

/* =========================================================================
   Tag - generic colored pill (different from StatusBadge)
   ========================================================================= */
type TagTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
interface TagProps {
  label: string;
  tone?: TagTone;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onRemove?: () => void;
}

export function Tag({ label, tone = 'neutral', icon, onPress, onRemove }: TagProps) {
  const cfg = {
    brand: { bg: 'bg-brand-soft', ink: 'text-brand', iconColor: '#003B8E' },
    success: { bg: 'bg-success-soft', ink: 'text-success-ink', iconColor: '#166534' },
    warning: { bg: 'bg-warning-soft', ink: 'text-warning-ink', iconColor: '#92400E' },
    danger: { bg: 'bg-danger-soft', ink: 'text-danger-ink', iconColor: '#991B1B' },
    info: { bg: 'bg-info-soft', ink: 'text-info-ink', iconColor: '#1E40AF' },
    neutral: { bg: 'bg-line-subtle', ink: 'text-ink-secondary-light', iconColor: '#475569' },
  }[tone];

  const Wrap = onPress ? Pressable : View;

  return (
    <Wrap onPress={onPress} className={[cfg.bg, 'flex-row items-center px-2 py-1 rounded-full self-start'].join(' ')}>
      {icon ? <Ionicons name={icon} size={11} color={cfg.iconColor} style={{ marginRight: 3 }} /> : null}
      <Text className={[cfg.ink, 'text-[11px] font-medium'].join(' ')}>{label}</Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={6} className="ml-1">
          <Ionicons name="close" size={11} color={cfg.iconColor} />
        </Pressable>
      ) : null}
    </Wrap>
  );
}

/* =========================================================================
   ConfirmDialog - inline modal confirmation (richer than Alert)
   ========================================================================= */
interface ConfirmProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const iconCfg =
    tone === 'danger'
      ? { bg: 'bg-danger-soft', color: '#DC2626', name: icon ?? 'alert-circle' }
      : { bg: 'bg-brand-soft', color: '#003B8E', name: icon ?? 'help-circle' };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-surface-light dark:bg-surface-dark rounded-2xl p-5">
          <View className={[iconCfg.bg, 'w-12 h-12 rounded-full items-center justify-center mb-3'].join(' ')}>
            <Ionicons name={iconCfg.name as keyof typeof Ionicons.glyphMap} size={24} color={iconCfg.color} />
          </View>
          <Text className="text-h3 font-medium text-ink-primary-light dark:text-ink-primary-dark">{title}</Text>
          {message ? (
            <Text className="text-helper text-ink-secondary-light dark:text-ink-secondary-dark mt-1.5">{message}</Text>
          ) : null}
          <View className="flex-row gap-2 mt-4">
            <AppButton label={cancelLabel} variant="outline" size="md" className="flex-1" onPress={onCancel} />
            <AppButton
              label={confirmLabel}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="md"
              className="flex-1"
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================================
   Spinner - centered loading spinner with optional label
   ========================================================================= */
interface SpinnerProps {
  label?: string;
  size?: 'small' | 'large';
}
export function Spinner({ label, size = 'large' }: SpinnerProps) {
  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#003B8E" />
      {label ? (
        <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-3">{label}</Text>
      ) : null}
    </View>
  );
}

/* =========================================================================
   ProgressRing - circular progress (animated)
   ========================================================================= */
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  label?: string;
}
export function ProgressRing({ progress, size = 56, label }: ProgressRingProps) {
  const stroke = 5;
  const inner = size - stroke * 2;
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
        }}
        className="border-line-subtle absolute"
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: 'transparent',
          borderTopColor: '#003B8E',
          borderRightColor: progress > 25 ? '#003B8E' : 'transparent',
          borderBottomColor: progress > 50 ? '#003B8E' : 'transparent',
          borderLeftColor: progress > 75 ? '#003B8E' : 'transparent',
          transform: [{ rotate: `${(progress / 100) * 360 - 90}deg` }],
        }}
        className="absolute"
      />
      <Text
        style={{ width: inner }}
        className="text-[11px] font-medium text-center text-ink-primary-light dark:text-ink-primary-dark"
      >
        {label ?? `${Math.round(progress)}%`}
      </Text>
    </View>
  );
}

/* =========================================================================
   PulseDot - animated live indicator
   ========================================================================= */
export function PulseDot({ tone = 'success' }: { tone?: 'success' | 'warning' | 'danger' }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.8, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [scale, opacity]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const toneClass = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }[tone];

  return (
    <View className="w-3 h-3 items-center justify-center">
      <Animated.View className={[toneClass, 'absolute w-2 h-2 rounded-full'].join(' ')} style={animated} />
      <View className={[toneClass, 'w-2 h-2 rounded-full'].join(' ')} />
    </View>
  );
}

/* =========================================================================
   ListRow - generic tappable list item
   ========================================================================= */
interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListRow({
  icon,
  iconTone = 'neutral',
  title,
  subtitle,
  rightSlot,
  onPress,
  showChevron = true,
}: ListRowProps) {
  const toneClass = {
    brand: 'bg-brand-soft',
    success: 'bg-success-soft',
    warning: 'bg-warning-soft',
    danger: 'bg-danger-soft',
    neutral: 'bg-page-light dark:bg-page-dark/40',
  }[iconTone];
  const iconColor = {
    brand: '#003B8E',
    success: '#166534',
    warning: '#92400E',
    danger: '#991B1B',
    neutral: '#475569',
  }[iconTone];

  return (
    <Pressable onPress={onPress} className="flex-row items-center p-3 bg-surface-light dark:bg-surface-dark">
      {icon ? (
        <View className={[toneClass, 'w-9 h-9 rounded-full items-center justify-center mr-3'].join(' ')}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">{title}</Text>
        {subtitle ? (
          <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {rightSlot}
      {showChevron && !rightSlot && onPress ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
    </Pressable>
  );
}
