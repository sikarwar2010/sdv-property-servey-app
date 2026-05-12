import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard, AppHeader, EmptyState, SegmentedControl, Tag } from '@/src/components';
import { formatTime } from '@/src/utils/format';

type ActivityType = 'all' | 'survey' | 'sync' | 'qc' | 'system';

interface ActivityEvent {
  id: string;
  type:
    | 'survey_created'
    | 'survey_submitted'
    | 'sync_success'
    | 'sync_failed'
    | 'qc_received'
    | 'login'
    | 'masters_refreshed';
  message: string;
  detail?: string;
  at: string;
  category: 'survey' | 'sync' | 'qc' | 'system';
}

const EVENTS: ActivityEvent[] = [
  {
    id: 'a1',
    type: 'survey_submitted',
    message: 'Submitted: Anita Sharma',
    detail: 'PR-12-00482 · Ward 12',
    at: '2026-05-12T09:42:00Z',
    category: 'survey',
  },
  {
    id: 'a2',
    type: 'sync_success',
    message: 'Synced 3 surveys',
    detail: '12 photos uploaded · 1.2 MB',
    at: '2026-05-12T09:43:00Z',
    category: 'sync',
  },
  {
    id: 'a3',
    type: 'qc_received',
    message: 'QC remarks received',
    detail: 'Priya Singh · 2 sections flagged',
    at: '2026-05-12T08:00:00Z',
    category: 'qc',
  },
  {
    id: 'a4',
    type: 'survey_created',
    message: 'Started new survey',
    detail: 'Suresh Yadav · Ward 18',
    at: '2026-05-12T07:24:00Z',
    category: 'survey',
  },
  {
    id: 'a5',
    type: 'sync_failed',
    message: 'Sync failed',
    detail: 'Mohan Lal Verma · timeout · retried',
    at: '2026-05-11T16:30:00Z',
    category: 'sync',
  },
  {
    id: 'a6',
    type: 'masters_refreshed',
    message: 'Master data refreshed',
    detail: '124 items updated',
    at: '2026-05-11T06:00:00Z',
    category: 'system',
  },
  {
    id: 'a7',
    type: 'login',
    message: 'Signed in',
    detail: 'rajesh.surveyor on Android 14',
    at: '2026-05-11T05:50:00Z',
    category: 'system',
  },
];

const ICON_MAP: Record<
  ActivityEvent['type'],
  { icon: keyof typeof Ionicons.glyphMap; tone: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  survey_created: { icon: 'add-circle-outline', tone: 'brand' },
  survey_submitted: { icon: 'send-outline', tone: 'success' },
  sync_success: { icon: 'cloud-done-outline', tone: 'success' },
  sync_failed: { icon: 'cloud-offline-outline', tone: 'danger' },
  qc_received: { icon: 'chatbubble-ellipses-outline', tone: 'warning' },
  login: { icon: 'log-in-outline', tone: 'neutral' },
  masters_refreshed: { icon: 'refresh-circle-outline', tone: 'brand' },
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return 'Today';
  if (d >= yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function ActivityScreen() {
  const [filter, setFilter] = useState<ActivityType>('all');

  const filtered = useMemo(() => (filter === 'all' ? EVENTS : EVENTS.filter((e) => e.category === filter)), [filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    filtered.forEach((e) => {
      const k = dayKey(e.at);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Activity log" subtitle={`${EVENTS.length} events in the last 7 days`} />

      <View className="px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-line-subtle">
        <SegmentedControl<ActivityType>
          items={[
            { value: 'all', label: 'All' },
            { value: 'survey', label: 'Surveys' },
            { value: 'sync', label: 'Sync' },
            { value: 'qc', label: 'QC' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        {grouped.length === 0 ? (
          <EmptyState icon="time-outline" title="No activity" message="Nothing happened in this category." />
        ) : (
          grouped.map(([day, events]) => (
            <View key={day} className="mb-5">
              <Text className="text-label uppercase tracking-wider font-medium text-ink-secondary-light mb-2">
                {day}
              </Text>
              <AppCard padded={false}>
                {events.map((e, i) => {
                  const cfg = ICON_MAP[e.type];
                  return (
                    <View key={e.id}>
                      <View className="flex-row items-start p-3">
                        <View
                          className={[
                            'w-8 h-8 rounded-full items-center justify-center',
                            cfg.tone === 'success' ? 'bg-success-soft' : '',
                            cfg.tone === 'danger' ? 'bg-danger-soft' : '',
                            cfg.tone === 'warning' ? 'bg-warning-soft' : '',
                            cfg.tone === 'brand' ? 'bg-brand-soft' : '',
                            cfg.tone === 'neutral' ? 'bg-line-subtle' : '',
                          ].join(' ')}
                        >
                          <Ionicons
                            name={cfg.icon}
                            size={15}
                            color={
                              cfg.tone === 'success'
                                ? '#166534'
                                : cfg.tone === 'danger'
                                  ? '#991B1B'
                                  : cfg.tone === 'warning'
                                    ? '#92400E'
                                    : cfg.tone === 'brand'
                                      ? '#003B8E'
                                      : '#475569'
                            }
                          />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                            {e.message}
                          </Text>
                          {e.detail ? (
                            <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                              {e.detail}
                            </Text>
                          ) : null}
                          <View className="flex-row items-center mt-1">
                            <Tag label={e.category} tone="neutral" />
                            <Text className="text-caption text-ink-disabled-light ml-2">{formatTime(e.at)}</Text>
                          </View>
                        </View>
                      </View>
                      {i < events.length - 1 ? <View className="h-px bg-line-subtle ml-14" /> : null}
                    </View>
                  );
                })}
              </AppCard>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
