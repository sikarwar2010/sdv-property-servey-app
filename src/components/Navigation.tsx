import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

/* =========================================================================
   SearchBar - standalone search input with optional cancel
   ========================================================================= */
interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search…', onCancel, autoFocus }: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 flex-row items-center bg-page-light dark:bg-page-dark/40 rounded-lg px-2.5 min-h-touch-md">
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          autoFocus={autoFocus}
          returnKeyType="search"
          className="flex-1 ml-2 py-2 text-body text-ink-primary-light dark:text-ink-primary-dark"
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color="#64748B" />
          </Pressable>
        ) : null}
      </View>
      {onCancel ? (
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text className="text-body text-brand font-medium">Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* =========================================================================
   StepIndicator - standalone progress for wizards (dots + line)
   ========================================================================= */
interface StepIndicatorProps {
  current: number;
  total: number;
  variant?: 'dots' | 'bar' | 'numbered';
  labels?: string[];
}

export function StepIndicator({ current, total, variant = 'dots', labels }: StepIndicatorProps) {
  if (variant === 'bar') {
    return (
      <View>
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-helper font-medium text-brand">
            Step {current} of {total}
          </Text>
          {labels && labels[current - 1] ? (
            <Text className="text-helper text-ink-tertiary-light">{labels[current - 1]}</Text>
          ) : null}
        </View>
        <View className="h-1 bg-line-subtle rounded-full overflow-hidden">
          <View className="h-full bg-brand" style={{ width: `${(current / total) * 100}%` }} />
        </View>
      </View>
    );
  }

  if (variant === 'numbered') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center px-1">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            return (
              <View key={i} className="flex-row items-center">
                <View
                  className={[
                    'w-7 h-7 rounded-full items-center justify-center',
                    done ? 'bg-brand' : active ? 'bg-brand' : 'bg-line-subtle',
                  ].join(' ')}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      className={['text-[11px] font-medium', active ? 'text-white' : 'text-ink-tertiary-light'].join(
                        ' ',
                      )}
                    >
                      {n}
                    </Text>
                  )}
                </View>
                {i < total - 1 ? (
                  <View className={['w-6 h-0.5', done ? 'bg-brand' : 'bg-line-subtle'].join(' ')} />
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // dots
  return (
    <View className="flex-row items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const active = i + 1 === current;
        const done = i + 1 < current;
        return (
          <View
            key={i}
            className={[
              'rounded-full',
              active ? 'w-5 h-1.5 bg-brand' : done ? 'w-1.5 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-line-subtle',
            ].join(' ')}
          />
        );
      })}
    </View>
  );
}

/* =========================================================================
   Tabs - internal tabs within a screen
   ========================================================================= */
interface TabItem {
  key: string;
  label: string;
  badge?: number;
}
interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pill';
}

export function Tabs({ items, value, onChange, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <View className="flex-row bg-page-light dark:bg-page-dark/40 rounded-lg p-1">
        {items.map((item) => {
          const active = item.key === value;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              className={[
                'flex-1 flex-row items-center justify-center py-2 rounded-md',
                active ? 'bg-surface-light dark:bg-surface-dark' : '',
              ].join(' ')}
              style={
                active
                  ? {
                      shadowColor: '#0F172A',
                      shadowOpacity: 0.06,
                      shadowRadius: 2,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text
                className={[
                  'text-[13px]',
                  active
                    ? 'text-ink-primary-light dark:text-ink-primary-dark font-medium'
                    : 'text-ink-tertiary-light dark:text-ink-tertiary-dark',
                ].join(' ')}
              >
                {item.label}
              </Text>
              {item.badge != null ? (
                <View className="ml-1 bg-brand rounded-full px-1.5 min-w-[16px] items-center">
                  <Text className="text-[10px] font-medium text-white">{item.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // underline
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row border-b border-line-subtle">
        {items.map((item) => {
          const active = item.key === value;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              className={[
                'flex-row items-center px-3 py-2.5 border-b-2',
                active ? 'border-brand' : 'border-transparent',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-[13px]',
                  active ? 'text-brand font-medium' : 'text-ink-tertiary-light dark:text-ink-tertiary-dark',
                ].join(' ')}
              >
                {item.label}
              </Text>
              {item.badge != null ? (
                <View className="ml-1.5 bg-brand-soft rounded-full px-1.5 min-w-[18px] items-center">
                  <Text className="text-[10px] font-medium text-brand">{item.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* =========================================================================
   SegmentedControl - iOS-style segmented control
   ========================================================================= */
interface SegmentItem<T extends string> {
  value: T;
  label: string;
}
interface SegmentedProps<T extends string> {
  items: ReadonlyArray<SegmentItem<T>>;
  value: T;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({ items, value, onChange }: SegmentedProps<T>) {
  return (
    <View className="flex-row bg-page-light dark:bg-page-dark/40 rounded-lg p-1">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            className={[
              'flex-1 items-center justify-center py-1.5 rounded-md',
              active ? 'bg-surface-light dark:bg-surface-dark' : '',
            ].join(' ')}
            style={
              active
                ? {
                    shadowColor: '#0F172A',
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 1,
                  }
                : undefined
            }
          >
            <Text
              className={[
                'text-[12px]',
                active
                  ? 'text-ink-primary-light dark:text-ink-primary-dark font-medium'
                  : 'text-ink-tertiary-light dark:text-ink-tertiary-dark',
              ].join(' ')}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
