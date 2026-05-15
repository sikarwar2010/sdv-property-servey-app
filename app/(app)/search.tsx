import { EmptyState, SearchBar, StatusBadge, Tag } from '@/src/components';
import { useLocalSurveys } from '@/src/hooks/use-local-surveys';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RECENT_SEARCHES = ['Ward 12', 'Anita Sharma', 'PR-12', 'Krishna Nagar'];
const SUGGESTIONS = [
  { label: 'Pending surveys', filter: 'pending' as const, icon: 'cloud-upload-outline' as const },
  { label: 'Failed surveys', filter: 'failed' as const, icon: 'alert-circle-outline' as const },
  { label: 'Draft surveys', filter: 'draft' as const, icon: 'document-outline' as const },
];

export default function SearchScreen() {
  const router = useRouter();
  const { surveys } = useLocalSurveys();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return surveys.filter(
      (s) =>
        s.ownerName.toLowerCase().includes(q) ||
        s.propertyNo.toLowerCase().includes(q) ||
        s.addressLine.toLowerCase().includes(q) ||
        s.wardNo.includes(q),
    );
  }, [surveys, query]);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <SafeAreaView edges={['top']} className="bg-surface-light dark:bg-surface-dark border-b border-line-subtle">
        <View className="px-3 py-2">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Owner, property no., ward…"
            autoFocus
            onCancel={() => router.back()}
          />
        </View>
      </SafeAreaView>

      {query.trim() === '' ? (
        <View className="p-4">
          <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
            Recent searches
          </Text>
          <View className="flex-row flex-wrap gap-1.5 mb-5">
            {RECENT_SEARCHES.map((t) => (
              <Tag key={t} label={t} tone="neutral" icon="time-outline" onPress={() => setQuery(t)} />
            ))}
          </View>

          <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
            Quick filters
          </Text>
          <View className="gap-2">
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s.filter}
                onPress={() => router.replace('/(app)/surveys' as Href)}
                className="flex-row items-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg border border-line-subtle"
              >
                <View className="w-9 h-9 rounded-full bg-brand-soft items-center justify-center">
                  <Ionicons name={s.icon} size={16} color="#003B8E" />
                </View>
                <Text className="flex-1 ml-3 text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {s.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={`No matches for "${query}"`}
              message="Try a different name or property number."
            />
          }
          ListHeaderComponent={
            results.length > 0 ? (
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mb-2">
                {results.length} result{results.length === 1 ? '' : 's'} · "{query}"
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/surveys/${item.id}` as Href)}
              className="p-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {item.ownerName}
                  </Text>
                  <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                    {item.propertyNo} · Ward {item.wardNo}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5"
                  >
                    {item.addressLine}
                  </Text>
                </View>
                <StatusBadge status={item.status} size="sm" />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
