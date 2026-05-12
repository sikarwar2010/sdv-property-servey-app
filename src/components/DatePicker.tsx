import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { BottomSheet } from './BottomSheet';

interface Props {
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (iso: string) => void;
  minDate?: Date;
  maxDate?: Date;
  errorText?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function DatePicker({ label, required, value, onChange, minDate, maxDate, errorText }: Props) {
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(value) : new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const [selected, setSelected] = useState<Date | null>(value ? new Date(value) : null);

  const grid = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSameDay = (a: Date, b: Date | null) =>
    !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const isOutOfRange = (d: Date) =>
    (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
    (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  const goNext = () =>
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));

  const handleConfirm = () => {
    if (selected) onChange(selected.toISOString());
    setOpen(false);
  };

  return (
    <View>
      {label ? (
        <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
          {label}
          {required ? <Text className="text-danger">{'  *'}</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={[
          'flex-row items-center px-3 py-2.5 rounded-lg border bg-surface-light dark:bg-surface-dark min-h-touch-md',
          errorText ? 'border-danger' : 'border-line-subtle',
        ].join(' ')}
      >
        <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <Text
          className={[
            'flex-1 text-body',
            value ? 'text-ink-primary-light dark:text-ink-primary-dark' : 'text-ink-disabled-light',
          ].join(' ')}
        >
          {value ? fmt(new Date(value)) : 'Select date'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </Pressable>
      {errorText ? (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text className="text-caption text-danger ml-1">{errorText}</Text>
        </View>
      ) : null}

      <BottomSheet visible={open} onClose={() => setOpen(false)} title="Select date">
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={goPrev} className="w-9 h-9 rounded-full items-center justify-center" hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </Pressable>
            <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {MONTHS[cursor.month]} {cursor.year}
            </Text>
            <Pressable onPress={goNext} className="w-9 h-9 rounded-full items-center justify-center" hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <View className="flex-row justify-around mt-2 mb-1">
            {WEEKDAYS.map((d, i) => (
              <Text key={i} className="w-9 text-center text-caption text-ink-tertiary-light">
                {d}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {grid.map((d, i) => {
              if (!d) return <View key={i} className="w-[14.285%] aspect-square" />;
              const sel = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              const dis = isOutOfRange(d);
              return (
                <Pressable
                  key={i}
                  disabled={dis}
                  onPress={() => setSelected(d)}
                  className="w-[14.285%] aspect-square p-0.5"
                >
                  <View
                    className={[
                      'flex-1 items-center justify-center rounded-full',
                      sel ? 'bg-brand' : isToday ? 'border border-brand' : '',
                    ].join(' ')}
                  >
                    <Text
                      className={[
                        'text-[13px]',
                        sel
                          ? 'text-white font-medium'
                          : dis
                            ? 'text-ink-disabled-light'
                            : isToday
                              ? 'text-brand font-medium'
                              : 'text-ink-primary-light dark:text-ink-primary-dark',
                      ].join(' ')}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-2 mt-3 mb-2">
            <AppButton label="Cancel" variant="outline" size="md" className="flex-1" onPress={() => setOpen(false)} />
            <AppButton label="Confirm" size="md" className="flex-1" disabled={!selected} onPress={handleConfirm} />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
