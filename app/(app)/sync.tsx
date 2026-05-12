import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppCard, OfflineBanner, SectionLabel, StatusBadge, EmptyState } from '@/src/components';
import { useSurveyStore } from '@/src/stores/survey';
import { useIsOnline } from '@/src/stores/network';

export default function SyncScreen() {
  const queue = useSurveyStore((s) => s.syncQueue);
  const online = useIsOnline();

  const pending = queue.filter((q) => q.status === 'pending' || q.status === 'syncing');
  const failed = queue.filter((q) => q.status === 'failed');
  const total = queue.length;
  const syncing = queue.find((q) => q.status === 'syncing');
  const overallProgress = syncing ? (syncing.progress ?? 0) : pending.length === 0 ? 100 : 0;

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="bg-surface-light dark:bg-surface-dark">
        <View className="px-4 pt-3 pb-3.5 border-b border-line-subtle">
          <Text className="text-h2 font-medium text-ink-primary-light dark:text-ink-primary-dark">Sync queue</Text>
          <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
            {online ? 'Connected · auto-uploading' : 'Offline · will resume when online'}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <AppCard padded className="mb-4">
          <View className="flex-row justify-between items-center mb-2.5">
            <View>
              <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark">
                {total} item{total === 1 ? '' : 's'} in queue
              </Text>
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                {pending.length} pending · {failed.length} failed
              </Text>
            </View>
            <AppButton label="Sync now" iconLeft="sync" size="sm" onPress={() => undefined} disabled={!online} />
          </View>
          <View className="h-1.5 bg-line-subtle rounded overflow-hidden">
            <View className="h-full bg-brand" style={{ width: `${overallProgress}%` }} />
          </View>
          <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1.5">
            {syncing
              ? `Uploading 1 of ${pending.length} · ${overallProgress}%`
              : pending.length === 0
                ? 'All up to date'
                : 'Waiting to start'}
          </Text>
        </AppCard>

        <SectionLabel>Pending ({pending.length})</SectionLabel>
        {pending.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="No pending surveys" message="Everything is synced." />
        ) : (
          pending.map((q) => (
            <View
              key={q.id}
              className="flex-row items-center p-3 mb-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle"
            >
              <View
                className={[
                  'w-7 h-7 rounded-full items-center justify-center mr-2.5',
                  q.status === 'syncing' ? 'bg-info-soft' : 'bg-warning-soft',
                ].join(' ')}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color={q.status === 'syncing' ? '#1E40AF' : '#92400E'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                  {q.ownerName}
                </Text>
                <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                  Ward {q.wardNo}
                  {q.progress != null ? ` · ${q.progress}%` : ' · queued'}
                </Text>
              </View>
              <StatusBadge status={q.status === 'syncing' ? 'syncing' : 'pending'} size="sm" />
            </View>
          ))
        )}

        {failed.length > 0 ? (
          <>
            <SectionLabel className="mt-4">Failed ({failed.length})</SectionLabel>
            {failed.map((q) => (
              <View
                key={q.id}
                className="flex-row items-center p-3 mb-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-line-subtle"
              >
                <View className="w-7 h-7 rounded-full items-center justify-center mr-2.5 bg-danger-soft">
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                    {q.ownerName}
                  </Text>
                  <Text numberOfLines={1} className="text-caption text-danger">
                    {q.errorMessage ?? 'Unknown error'} · retry in 2 m
                  </Text>
                  <Text className="text-caption text-ink-disabled-light">Retried {q.retryCount} times</Text>
                </View>
                <AppButton label="Retry" iconLeft="refresh" variant="outline" size="sm" onPress={() => undefined} />
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
