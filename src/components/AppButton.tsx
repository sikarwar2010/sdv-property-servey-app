import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  haptic?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ButtonSize, { container: string; icon: number; text: string }> = {
  sm: { container: 'h-touch-sm px-3', icon: 14, text: 'text-[12px]' },
  md: { container: 'h-touch-md px-4', icon: 16, text: 'text-[13px]' },
  lg: { container: 'h-touch px-5', icon: 18, text: 'text-[14px]' },
};

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; text: string; spinner: string }> = {
  primary: { container: 'bg-brand active:bg-brand-strong', text: 'text-white', spinner: '#FFFFFF' },
  secondary: {
    container: 'bg-brand-soft active:bg-brand-muted dark:bg-brand/30',
    text: 'text-brand dark:text-white',
    spinner: '#003B8E',
  },
  outline: {
    container: 'bg-transparent border-[1.5px] border-brand active:bg-brand-soft',
    text: 'text-brand',
    spinner: '#003B8E',
  },
  ghost: { container: 'bg-transparent active:bg-brand-soft', text: 'text-brand', spinner: '#003B8E' },
  danger: { container: 'bg-danger active:bg-danger-ink', text: 'text-white', spinner: '#FFFFFF' },
};

export function AppButton({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  haptic = true,
  onPress,
  className = '',
  ...rest
}: Props) {
  const sizeCfg = SIZE_CLASSES[size];
  const variantCfg = VARIANT_CLASSES[variant];
  const isDisabled = disabled || loading;

  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress?.(e);
  };

  const iconColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#003B8E';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-lg',
        sizeCfg.container,
        isDisabled ? 'bg-line-subtle' : variantCfg.container,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantCfg.spinner} />
      ) : (
        <View className="flex-row items-center">
          {iconLeft ? (
            <Ionicons
              name={iconLeft}
              size={sizeCfg.icon}
              color={isDisabled ? '#94A3B8' : iconColor}
              className="mr-1.5"
            />
          ) : null}
          <Text
            className={[
              'font-medium',
              sizeCfg.text,
              isDisabled ? 'text-ink-disabled-light' : variantCfg.text,
              iconLeft ? 'ml-1.5' : '',
              iconRight ? 'mr-1.5' : '',
            ].join(' ')}
          >
            {label}
          </Text>
          {iconRight ? (
            <Ionicons
              name={iconRight}
              size={sizeCfg.icon}
              color={isDisabled ? '#94A3B8' : iconColor}
              className="ml-1.5"
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
