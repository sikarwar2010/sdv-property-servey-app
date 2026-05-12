import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppButton,
  AppCard,
  AppHeader,
  Banner,
  ListRow,
  ProgressRing,
  SectionLabel,
  SyncIndicator,
  Toast,
} from '@/src/components';
import { useIsOnline } from '@/src/stores/network';

interface Category {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  itemCount: number;
  sizeKb: number;
  lastUpdated: string;
}

const CATEGORIES: Category[] = [
  { key: 'ulbs', label: 'ULBs & wards', icon: 'business-outline', itemCount: 124, sizeKb: 14, lastUpdated: '2 hr ago' },
  {
    key: 'property-types',
    label: 'Property types',
    icon: 'home-outline',
    itemCount: 5,
    sizeKb: 2,
    lastUpdated: '2 hr ago',
  },
  {
    key: 'usage-types',
    label: 'Usage types',
    icon: 'briefcase-outline',
    itemCount: 12,
    sizeKb: 3,
    lastUpdated: '2 hr ago',
  },
  {
    key: 'construction',
    label: 'Construction types',
    icon: 'construct-outline',
    itemCount: 8,
    sizeKb: 2,
    lastUpdated: '2 hr ago',
  },
  {
    key: 'taxation',
    label: 'Tax zones & rates',
    icon: 'cash-outline',
    itemCount: 24,
    sizeKb: 5,
    lastUpdated: '2 hr ago',
  },
  {
    key: 'services',
    label: 'Service options',
    icon: 'water-outline',
    itemCount: 18,
    sizeKb: 3,
    lastUpdated: '2 hr ago',
  },
];

export default function MastersScreen() {
  const online = useIsOnline();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);

  const totalSize = CATEGORIES.reduce((acc, c) => acc + c.sizeKb, 0);
  const totalItems = CATEGORIES.reduce((acc, c) => acc + c.itemCount, 0);

  const handleSyncAll = () => {
    if (!online) return;
    setSyncing('all');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setSyncing(null);
          setToast(true);
          return 0;
        }
        return p + 10;
      });
    }, 120);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Master data" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <AppCard padded className="mb-4">
          <View className="flex-row items-center">
            <ProgressRing progress={syncing ? progress : 100} size={64} />
            <View className="flex-1 ml-3">
              <Text className="text-h3 font-medium text-ink-primary-light dark:text-ink-primary-dark">All synced</Text>
              <Text className="text-helper text-ink-tertiary-light dark:text-ink-tertiary-dark mt-0.5">
                {totalItems} items · {totalSize} KB cached
              </Text>
              <View className="mt-1.5">
                <SyncIndicator
                  state={syncing ? 'syncing' : 'success'}
                  message={syncing ? `Syncing ${progress}%` : 'Up to date'}
                />
              </View>
            </View>
          </View>
          <AppButton
            label={syncing ? 'Syncing…' : 'Refresh all'}
            iconLeft="refresh"
            onPress={handleSyncAll}
            disabled={!online || syncing !== null}
            fullWidth
            size="md"
            className="mt-4"
          />
        </AppCard>

        {!online ? (
          <Banner
            tone="warning"
            title="Offline"
            message="Master data refresh requires internet. Cached data is being used."
          />
        ) : null}

        <SectionLabel className="mt-4">Categories</SectionLabel>
        <AppCard padded={false}>
          {CATEGORIES.map((c, i, arr) => (
            <View key={c.key}>
              <ListRow
                icon={c.icon}
                iconTone="brand"
                title={c.label}
                subtitle={`${c.itemCount} items · ${c.sizeKb} KB · ${c.lastUpdated}`}
                rightSlot={
                  <View className="bg-success-soft px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-medium text-success-ink uppercase" style={{ letterSpacing: 0.4 }}>
                      Fresh
                    </Text>
                  </View>
                }
              />
              {i < arr.length - 1 ? <View className="h-px bg-line-subtle" /> : null}
            </View>
          ))}
        </AppCard>

        <Text className="text-caption text-center text-ink-tertiary-light dark:text-ink-tertiary-dark mt-4">
          Master data auto-refreshes daily at 6 AM when online.
        </Text>
      </ScrollView>

      <Toast
        visible={toast}
        title="Master data updated"
        message={`${totalItems} items refreshed`}
        tone="success"
        onHide={() => setToast(false)}
      />
    </View>
  );
}
