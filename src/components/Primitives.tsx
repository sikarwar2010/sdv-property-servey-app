import type { SurveyStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

/* =========================================================================
   StatusBadge
   ========================================================================= */
const STATUS_MAP: Record<SurveyStatus, { container: string; text: string; label: string }> = {
  draft: {
    container: 'bg-line-subtle dark:bg-page-dark',
    text: 'text-ink-secondary-light dark:text-ink-secondary-dark',
    label: 'Draft',
  },
  pending: { container: 'bg-warning-soft', text: 'text-warning-ink', label: 'Pending' },
  syncing: { container: 'bg-info-soft', text: 'text-info-ink', label: 'Syncing' },
  synced: { container: 'bg-success-soft', text: 'text-success-ink', label: 'Synced' },
  failed: { container: 'bg-danger-soft', text: 'text-danger-ink', label: 'Failed' },
};

export function StatusBadge({ status, size = 'md' }: { status: SurveyStatus; size?: 'sm' | 'md' }) {
  const cfg = STATUS_MAP[status];
  return (
    <View
      className={[cfg.container, size === 'sm' ? 'px-1.5 py-0.5' : 'px-2.5 py-1', 'rounded-full self-start'].join(' ')}
    >
      <Text
        className={[cfg.text, 'font-medium uppercase', size === 'sm' ? 'text-[9px]' : 'text-[10px]'].join(' ')}
        style={{ letterSpacing: 0.4 }}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

/* =========================================================================
   AppCard
   ========================================================================= */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  bordered?: boolean;
}
export function AppCard({ children, className = '', padded = true, bordered = true }: CardProps) {
  return (
    <View
      className={[
        'bg-surface-light dark:bg-surface-dark rounded-xl',
        bordered ? 'border border-line-subtle' : '',
        padded ? 'p-3.5' : '',
        className,
      ].join(' ')}
    >
      {children}
    </View>
  );
}

/* =========================================================================
   SectionLabel
   ========================================================================= */
export function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      className={[
        'text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-2',
        className,
      ].join(' ')}
    >
      {children}
    </Text>
  );
}

/* =========================================================================
   ChipSelector
   ========================================================================= */
interface ChipProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string; icon?: keyof typeof Ionicons.glyphMap }>;
  value: T | T[];
  onChange: (value: T) => void;
  multi?: boolean;
  size?: 'sm' | 'md';
}
export function ChipSelector<T extends string>({ options, value, onChange, multi = false, size = 'md' }: ChipProps<T>) {
  const isActive = (v: T) => (multi ? Array.isArray(value) && value.includes(v) : value === v);
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = isActive(opt.value);
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={[
              'flex-row items-center rounded-full border',
              size === 'sm' ? 'px-2.5 py-1.5' : 'px-3.5 py-2',
              active ? 'bg-brand border-brand' : 'bg-surface-light dark:bg-surface-dark border-line-subtle',
            ].join(' ')}
          >
            {opt.icon ? (
              <Ionicons name={opt.icon} size={14} color={active ? '#FFFFFF' : '#475569'} style={{ marginRight: 6 }} />
            ) : null}
            <Text
              className={[
                active ? 'text-white' : 'text-ink-secondary-light dark:text-ink-secondary-dark',
                'font-medium',
                size === 'sm' ? 'text-[11px]' : 'text-[12px]',
              ].join(' ')}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* =========================================================================
   NumberStepper
   ========================================================================= */
interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}
export function NumberStepper({ value, onChange, min = 0, max = 99, step = 1 }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const decDisabled = value <= min;
  const incDisabled = value >= max;
  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={decrement}
        disabled={decDisabled}
        className={[
          'w-touch-md h-touch-md rounded-lg items-center justify-center',
          decDisabled ? 'bg-page-light' : 'bg-brand-soft active:bg-brand-muted',
        ].join(' ')}
      >
        <Ionicons name="remove" size={20} color={decDisabled ? '#94A3B8' : '#003B8E'} />
      </Pressable>
      <View className="flex-1 h-touch-md mx-3 bg-surface-light dark:bg-surface-dark rounded-lg border border-line-subtle items-center justify-center">
        <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark">{value}</Text>
      </View>
      <Pressable
        onPress={increment}
        disabled={incDisabled}
        className={[
          'w-touch-md h-touch-md rounded-lg items-center justify-center',
          incDisabled ? 'bg-page-light' : 'bg-brand active:bg-brand-strong',
        ].join(' ')}
      >
        <Ionicons name="add" size={20} color={incDisabled ? '#94A3B8' : '#FFFFFF'} />
      </Pressable>
    </View>
  );
}
