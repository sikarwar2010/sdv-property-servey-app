import { AppHeader, Avatar, SegmentedControl, StatusBadge } from '@/src/components';
import { useLocalSurveys } from '@/src/hooks/use-local-surveys';
import { useAuthStore } from '@/src/stores/auth';
import type { SurveyStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Filter = 'all' | SurveyStatus;

// Synthetic positions for surveys (since no react-native-maps in this build)
const POSITIONS: Record<string, { x: number; y: number }> = {
  s1: { x: 0.25, y: 0.35 },
  s2: { x: 0.55, y: 0.55 },
  s3: { x: 0.7, y: 0.25 },
  s4: { x: 0.4, y: 0.7 },
};

export default function MapScreen() {
  const router = useRouter();
  const { surveys } = useLocalSurveys();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? surveys : surveys.filter((s) => s.status === filter)),
    [surveys, filter],
  );
  const selected = surveys.find((s) => s.id === selectedId);

  const markerColor: Record<SurveyStatus, string> = {
    synced: '#16A34A',
    pending: '#F59E0B',
    syncing: '#0EA5E9',
    failed: '#DC2626',
    draft: '#64748B',
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader
        title="Map view"
        subtitle={`${user?.ulbName ?? ''} · Wards ${user?.wardAssignments.join(', ') ?? ''}`}
      />

      <View className="px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-line-subtle">
        <SegmentedControl<Filter>
          items={[
            { value: 'all', label: 'All' },
            { value: 'synced', label: 'Synced' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      {/* Stylized map canvas with grid overlay */}
      <View className="flex-1 bg-brand-soft relative overflow-hidden">
        {/* Grid lines */}
        <View className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-brand/15"
              style={{ top: `${(i + 1) * 12}%` }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-brand/15"
              style={{ left: `${(i + 1) * 12}%` }}
            />
          ))}
        </View>

        {/* Ward outline (decorative) */}
        <View
          className="absolute border-2 border-dashed border-brand/40 rounded-2xl"
          style={{ left: '10%', top: '15%', right: '10%', bottom: '20%' }}
        />
        <Text
          className="absolute text-[10px] font-medium text-brand/60 uppercase"
          style={{ left: '12%', top: '17%', letterSpacing: 0.5 }}
        >
          Ward 12 · Krishna Nagar
        </Text>

        {/* Compass */}
        <View className="absolute top-4 right-4 bg-surface-light/95 rounded-full w-9 h-9 items-center justify-center">
          <Ionicons name="navigate" size={16} color="#003B8E" />
        </View>

        {/* Survey markers */}
        {filtered.map((s) => {
          const pos = POSITIONS[s.id] ?? { x: 0.5, y: 0.5 };
          const active = selectedId === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSelectedId(active ? null : s.id)}
              className="absolute"
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                transform: [{ translateX: -16 }, { translateY: -32 }],
              }}
            >
              <View className="items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center border-2 border-white"
                  style={{
                    backgroundColor: markerColor[s.status],
                    transform: [{ scale: active ? 1.2 : 1 }],
                    shadowColor: '#0F172A',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  }}
                >
                  <Ionicons name="home" size={14} color="#FFFFFF" />
                </View>
                <View
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"
                  style={{ borderTopWidth: 8, borderTopColor: markerColor[s.status], marginTop: -2 }}
                />
              </View>
            </Pressable>
          );
        })}

        {/* Legend */}
        <View className="absolute left-4 bottom-4 bg-surface-light/95 rounded-lg p-2.5">
          <Text
            className="text-[10px] font-medium uppercase text-ink-secondary-light mb-1.5"
            style={{ letterSpacing: 0.4 }}
          >
            Legend
          </Text>
          <LegendDot color={markerColor.synced} label="Synced" />
          <LegendDot color={markerColor.pending} label="Pending" />
          <LegendDot color={markerColor.failed} label="Failed" />
        </View>

        {/* Selected survey card */}
        {selected ? (
          <Pressable
            onPress={() => router.push(`/(app)/surveys/${selected.id}` as Href)}
            className="absolute left-4 right-4 bottom-4 bg-surface-light dark:bg-surface-dark rounded-xl p-3 flex-row items-center"
            style={{
              shadowColor: '#0F172A',
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Avatar name={selected.ownerName} tone="brand" size="md" />
            <View className="flex-1 ml-3">
              <Text className="text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
                {selected.ownerName}
              </Text>
              <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">
                {selected.propertyNo} · {selected.addressLine}
              </Text>
            </View>
            <StatusBadge status={selected.status} size="sm" />
          </Pressable>
        ) : null}
      </View>

      {!selected ? (
        <View className="px-4 py-2 bg-surface-light dark:bg-surface-dark border-t border-line-subtle">
          <Text className="text-caption text-center text-ink-tertiary-light dark:text-ink-tertiary-dark">
            {filtered.length} marker{filtered.length === 1 ? '' : 's'} · Tap a pin for details
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center py-0.5">
      <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: color }} />
      <Text className="text-[11px] text-ink-primary-light dark:text-ink-primary-dark">{label}</Text>
    </View>
  );
}
