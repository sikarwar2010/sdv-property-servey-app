import { EmptyState, OfflineBanner, SearchBar, SurveyCard } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import type { SurveyStatus } from '@/src/types/index';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | SurveyStatus;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'pending', label: 'Pending' },
  { value: 'synced', label: 'Synced' },
  { value: 'failed', label: 'Failed' },
];

export default function SurveysListScreen() {
  const router = useRouter();
  const surveys = useSurveyStore((s) => s.surveys);
  const startDraft = useSurveyStore((s) => s.startDraft);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surveys.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.ownerName.toLowerCase().includes(q) ||
        s.propertyNo.toLowerCase().includes(q) ||
        s.addressLine.toLowerCase().includes(q)
      );
    });
  }, [surveys, filter, query]);

  const countOf = (f: Filter) => (f === 'all' ? surveys.length : surveys.filter((s) => s.status === f).length);

  const handleNew = () => {
    startDraft();
    router.push('/(app)/surveys/new' as Href);
  };

  const handleOpen = (id: string, status: SurveyStatus) => {
    if (status === 'failed') {
      router.push(`/(app)/surveys/qc?id=${id}` as Href);
    } else if (status === 'draft') {
      router.push('/(app)/surveys/wizard' as Href);
    } else {
      router.push(`/(app)/surveys/${id}` as Href);
    }
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="bg-surface-light dark:bg-surface-dark">
        <View className="px-4 pt-3 pb-3 border-b border-line-subtle">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-h1 font-medium text-ink-primary-light dark:text-ink-primary-dark">Surveys</Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => router.push('/(app)/search' as Href)}
                hitSlop={6}
                className="w-9 h-9 rounded-full bg-page-light dark:bg-page-dark/40 items-center justify-center"
              >
                <Ionicons name="search" size={16} color="#0F172A" />
              </Pressable>
              <Pressable
                onPress={handleNew}
                className="flex-row items-center px-3 py-2 rounded-full bg-brand active:bg-brand-strong max-w-[52%]"
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text className="ml-1 text-[11px] font-medium text-white shrink" numberOfLines={1}>
                  New survey
                </Text>
              </Pressable>
            </View>
          </View>

          <SearchBar value={query} onChangeText={setQuery} placeholder="Quick filter…" />

          <FlatList
            data={FILTERS}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            ItemSeparatorComponent={() => <View className="w-1.5" />}
            renderItem={({ item }) => {
              const active = filter === item.value;
              return (
                <Pressable
                  onPress={() => setFilter(item.value)}
                  className={['px-3 py-1.5 rounded-full', active ? 'bg-brand' : 'bg-line-subtle'].join(' ')}
                >
                  <Text
                    className={[
                      'text-[11px] font-medium',
                      active ? 'text-white' : 'text-ink-secondary-light dark:text-ink-secondary-dark',
                    ].join(' ')}
                  >
                    {item.label} · {countOf(item.value)}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => <SurveyCard survey={item} onPress={() => handleOpen(item.id, item.status)} />}
        ListEmptyComponent={
          <EmptyState
            title="No surveys yet"
            message="Start your first ward survey to see it here."
            actionLabel="Start new survey"
            onAction={handleNew}
          />
        }
      />
    </View>
  );
}
