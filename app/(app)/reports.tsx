import {
  AppCard,
  AppHeader,
  Banner,
  KpiCard,
  ProgressRing,
  SectionLabel,
  SegmentedControl,
  Tabs,
  Tag,
} from '@/src/components';
import { useSurveyKpi } from '@/src/hooks/use-survey-kpi';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

type Range = 'today' | 'week' | 'month';

const WARD_BREAKDOWN = [
  { ward: '12', name: 'Krishna Nagar', count: 18, target: 20, color: '#003B8E' },
  { ward: '14', name: 'Govind Vihar', count: 14, target: 20, color: '#16A34A' },
  { ward: '18', name: 'Gokul Marg', count: 15, target: 20, color: '#F59E0B' },
];

const HOURLY_BARS = [
  { hour: '9 AM', count: 2 },
  { hour: '10 AM', count: 3 },
  { hour: '11 AM', count: 1 },
  { hour: '12 PM', count: 0 },
  { hour: '1 PM', count: 1 },
  { hour: '2 PM', count: 3 },
  { hour: '3 PM', count: 2 },
  { hour: '4 PM', count: 2 },
];

export default function ReportsScreen() {
  const [range, setRange] = useState<Range>('today');
  const [tab, setTab] = useState('overview');
  const kpi = useSurveyKpi();

  const target = range === 'today' ? 10 : range === 'week' ? 50 : 200;
  const achieved = range === 'today' ? kpi.today : range === 'week' ? 47 : 142;
  const pct = Math.min(100, (achieved / target) * 100);
  const maxBar = Math.max(...HOURLY_BARS.map((b) => b.count), 1);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Reports" subtitle="Daily and weekly survey statistics" />

      <View className="px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-line-subtle">
        <SegmentedControl<Range>
          items={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This week' },
            { value: 'month', label: 'This month' },
          ]}
          value={range}
          onChange={setRange}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <AppCard padded className="mb-4">
          <View className="flex-row items-center">
            <ProgressRing progress={pct} size={84} />
            <View className="flex-1 ml-4">
              <Text className="text-helper uppercase tracking-wider font-medium text-ink-secondary-light">
                Target progress
              </Text>
              <Text className="text-display font-medium text-ink-primary-light dark:text-ink-primary-dark mt-0.5">
                {achieved}
                <Text className="text-h3 text-ink-tertiary-light"> / {target}</Text>
              </Text>
              <View className="flex-row gap-1.5 mt-1.5">
                <Tag
                  label={pct >= 100 ? 'Target hit' : pct >= 80 ? 'On track' : pct >= 50 ? 'Behind' : 'Lagging'}
                  tone={pct >= 100 ? 'success' : pct >= 80 ? 'brand' : pct >= 50 ? 'warning' : 'danger'}
                  icon="flag"
                />
              </View>
            </View>
          </View>
        </AppCard>

        <View className="mb-4">
          <Tabs
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'wards', label: 'Wards' },
              { key: 'hourly', label: 'Hourly' },
            ]}
            value={tab}
            onChange={setTab}
            variant="underline"
          />
        </View>

        {tab === 'overview' ? (
          <>
            <View className="flex-row flex-wrap -mx-0.5 mb-4">
              <View className="w-1/2 p-0.5">
                <KpiCard icon="document-text-outline" iconColor="#003B8E" value={achieved} label="Completed" />
              </View>
              <View className="w-1/2 p-0.5">
                <KpiCard icon="trending-up-outline" iconColor="#16A34A" value="+12%" label="vs last period" />
              </View>
              <View className="w-1/2 p-0.5">
                <KpiCard icon="time-outline" iconColor="#F59E0B" value="14m" label="Avg per survey" />
              </View>
              <View className="w-1/2 p-0.5">
                <KpiCard icon="image-outline" iconColor="#0EA5E9" value={achieved * 3} label="Photos uploaded" />
              </View>
            </View>

            <SectionLabel>Status breakdown</SectionLabel>
            <AppCard padded>
              <StatusBar label="Synced" count={kpi.submitted} total={kpi.total} color="#16A34A" />
              <StatusBar label="Pending" count={kpi.pending} total={kpi.total} color="#F59E0B" />
              <StatusBar label="Failed" count={kpi.failed} total={kpi.total} color="#DC2626" />
              <StatusBar label="Drafts" count={kpi.drafts} total={kpi.total} color="#64748B" last />
            </AppCard>
          </>
        ) : tab === 'wards' ? (
          <>
            <SectionLabel>Ward breakdown</SectionLabel>
            {WARD_BREAKDOWN.map((w) => {
              const wpct = Math.min(100, (w.count / w.target) * 100);
              return (
                <AppCard padded key={w.ward} className="mb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                      <Text className="ml-2 text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                        Ward {w.ward} — {w.name}
                      </Text>
                    </View>
                    <Text className="text-caption font-medium text-ink-secondary-light">
                      {w.count} / {w.target}
                    </Text>
                  </View>
                  <View className="h-1.5 bg-line-subtle rounded-full overflow-hidden">
                    <View className="h-full" style={{ width: `${wpct}%`, backgroundColor: w.color }} />
                  </View>
                  <Text className="text-caption text-ink-tertiary-light mt-1.5">
                    {wpct >= 100 ? '🎯 Target met' : `${Math.round(wpct)}% complete · ${w.target - w.count} to go`}
                  </Text>
                </AppCard>
              );
            })}
          </>
        ) : (
          <>
            <SectionLabel>Hourly distribution</SectionLabel>
            <AppCard padded>
              <View className="flex-row items-end justify-between" style={{ height: 120 }}>
                {HOURLY_BARS.map((b) => (
                  <View key={b.hour} className="items-center" style={{ flex: 1 }}>
                    <View
                      className="bg-brand rounded-t-md w-5"
                      style={{ height: `${(b.count / maxBar) * 100}%`, minHeight: 2 }}
                    />
                    <Text className="text-[9px] text-ink-tertiary-light mt-1">{b.hour}</Text>
                  </View>
                ))}
              </View>
              <View className="flex-row justify-between mt-3 pt-3 border-t border-line-subtle">
                <Stat label="Peak hour" value="2 PM" />
                <Stat label="Total" value={String(HOURLY_BARS.reduce((a, b) => a + b.count, 0))} />
                <Stat label="Avg / hr" value="1.75" />
              </View>
            </AppCard>
          </>
        )}

        <Banner
          tone="brand"
          title="Keep going"
          message={`You're ${Math.round(pct)}% to today's target. Just ${Math.max(0, target - achieved)} more surveys to hit it.`}
          icon="flag"
        />
      </ScrollView>
    </View>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
  last,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  last?: boolean;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className={!last ? 'mb-3 pb-3 border-b border-line-subtle' : ''}>
      <View className="flex-row justify-between mb-1">
        <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">{label}</Text>
        <Text className="text-caption text-ink-secondary-light">
          {count} ({Math.round(pct)}%)
        </Text>
      </View>
      <View className="h-1 bg-line-subtle rounded-full overflow-hidden">
        <View className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-caption text-ink-tertiary-light">{label}</Text>
      <Text className="text-h3 font-medium text-ink-primary-light dark:text-ink-primary-dark">{value}</Text>
    </View>
  );
}
