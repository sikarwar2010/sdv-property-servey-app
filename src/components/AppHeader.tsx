import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  variant?: 'light' | 'brand';
  step?: { current: number; total: number; label?: string };
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightSlot,
  variant = 'light',
  step,
}: Props) {
  const router = useRouter();
  const isBrand = variant === 'brand';
  const handleBack = () => (onBack ? onBack() : router.canGoBack() ? router.back() : null);

  return (
    <SafeAreaView edges={['top']} className={isBrand ? 'bg-brand' : 'bg-surface-light dark:bg-surface-dark'}>
      <View
        className={[
          'flex-row items-center px-2 py-2 min-h-[56px]',
          isBrand ? '' : 'border-b border-line-subtle',
        ].join(' ')}
      >
        {showBack ? (
          <Pressable onPress={handleBack} className="w-9 h-9 items-center justify-center" hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={isBrand ? '#FFFFFF' : '#0F172A'} />
          </Pressable>
        ) : (
          <View className="w-9" />
        )}
        <View className="flex-1 px-1">
          {subtitle ? (
            <Text
              numberOfLines={1}
              className={[
                'text-caption',
                isBrand ? 'text-white/70' : 'text-ink-tertiary-light dark:text-ink-tertiary-dark',
              ].join(' ')}
            >
              {subtitle}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            className={[
              'text-h3 font-medium',
              isBrand ? 'text-white' : 'text-ink-primary-light dark:text-ink-primary-dark',
            ].join(' ')}
          >
            {title}
          </Text>
        </View>
        <View className="min-w-[36px] items-end">{rightSlot}</View>
      </View>
      {step ? (
        <View className="px-4 pb-3 border-b border-line-subtle">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-helper font-medium text-brand">
              Step {step.current} of {step.total}
            </Text>
            {step.label ? <Text className="text-helper text-ink-tertiary-light">{step.label}</Text> : null}
          </View>
          <View className="h-1 bg-line-subtle rounded-full overflow-hidden">
            <View
              className="h-full bg-brand"
              style={{ width: `${(step.current / step.total) * 100}%` }}
            />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
