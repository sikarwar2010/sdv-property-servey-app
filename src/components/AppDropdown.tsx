import type { DropdownOption } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  errorText?: string;
}

export function AppDropdown({
  label,
  required,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  searchPlaceholder = 'Search…',
  errorText,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <View>
      {label ? (
        <Text className="text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
          {label}
          {required ? <Text className="text-danger">{'  *'}</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={[
          'flex-row items-center rounded-lg border min-h-touch-md px-3 py-2.5 bg-surface-light dark:bg-surface-dark',
          errorText ? 'border-danger' : 'border-line-subtle',
        ].join(' ')}
      >
        <Text
          numberOfLines={1}
          className={[
            'flex-1 text-body',
            selected ? 'text-ink-primary-light dark:text-ink-primary-dark' : 'text-ink-disabled-light',
          ].join(' ')}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </Pressable>
      {errorText ? (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text className="text-caption text-danger ml-1">{errorText}</Text>
        </View>
      ) : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <SafeAreaView edges={['bottom']}>
            <View className="bg-surface-light dark:bg-surface-dark rounded-t-2xl pb-3">
              <View className="items-center pt-2.5 pb-1">
                <View className="w-10 h-1 bg-line-subtle rounded-full" />
              </View>
              <View className="flex-row items-center justify-between px-4 pb-3 border-b border-line-subtle">
                <Text className="text-h3 font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {label ?? 'Select'}
                </Text>
                <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color="#475569" />
                </Pressable>
              </View>
              <View className="flex-row items-center bg-page-light dark:bg-page-dark/50 rounded-lg mx-4 mt-3 px-2.5">
                <Ionicons name="search" size={16} color="#64748B" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2 py-2 text-body text-ink-primary-light dark:text-ink-primary-dark"
                />
              </View>
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.value}
                style={{ maxHeight: 360 }}
                ItemSeparatorComponent={() => <View className="h-px bg-line-subtle ml-4" />}
                renderItem={({ item }) => {
                  const active = item.value === value;
                  return (
                    <Pressable
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={[
                        'flex-row items-center px-4 py-3.5',
                        active ? 'bg-brand-soft' : 'active:bg-page-light',
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'flex-1 text-body',
                          active ? 'text-brand font-medium' : 'text-ink-primary-light dark:text-ink-primary-dark',
                        ].join(' ')}
                      >
                        {item.label}
                      </Text>
                      {active ? <Ionicons name="checkmark" size={18} color="#003B8E" /> : null}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <View className="p-6 items-center">
                    <Text className="text-body text-ink-tertiary-light dark:text-ink-tertiary-dark">No matches</Text>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
