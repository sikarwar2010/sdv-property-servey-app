import { AppButton, AppCard, AppHeader, SectionLabel } from '@/src/components';
import { useLocalSurveys } from '@/src/hooks/use-local-surveys';
import { useIsOnline, useNetworkStore } from '@/src/stores/network';
import { syncEngine } from '@/src/sync/sync-engine';
import { timeAgo } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function OfflineScreen() {
  const online = useIsOnline();
  const lastSyncAt = useNetworkStore((s) => s.lastSyncAt);
  const { surveys } = useLocalSurveys();
  const [busy, setBusy] = useState(false);
  const pending = surveys.filter((s) => s.status === 'pending' || s.status === 'failed');
  const drafts = surveys.filter((s) => s.status === 'draft');

  const runSync = async () => {
    if (!online || busy) return;
    setBusy(true);
    try {
      await syncEngine.run();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Offline mode" subtitle="What you can still do" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <View
          className={['items-center py-6 px-4 rounded-xl', online ? 'bg-success-soft' : 'bg-warning-soft'].join(' ')}
        >
          <View
            className={[
              'w-11 h-11 rounded-full items-center justify-center',
              online ? 'bg-success' : 'bg-warning',
            ].join(' ')}
          >
            <Ionicons name={online ? 'wifi' : 'cloud-offline'} size={22} color="#FFFFFF" />
          </View>
          <Text className={['text-h3 font-medium mt-2.5', online ? 'text-success-ink' : 'text-warning-ink'].join(' ')}>
            {online ? "You're connected" : "You're offline"}
          </Text>
          <Text
            className={['text-helper mt-1 text-center', online ? 'text-success-ink' : 'text-warning-ink'].join(' ')}
          >
            Last sync {timeAgo(lastSyncAt)} · {pending.length} to send · {drafts.length} draft
            {drafts.length === 1 ? '' : 's'}
          </Text>
        </View>

        <SectionLabel className="mt-5">You can still…</SectionLabel>
        <AppCard padded={false}>
          <CheckRow icon="document-text-outline" label="Create new surveys" yes />
          <CheckRow icon="cloud-download-outline" label="Use cached masters" yes />
          <CheckRow icon="image-outline" label="Capture photos locally" yes />
          <CheckRow icon="location-outline" label="Record GPS coordinates" yes />
          <CheckRow icon="cloud-upload-outline" label="Sync to server" yes={false} last />
        </AppCard>

        <SectionLabel className="mt-5">Auto-sync triggers</SectionLabel>
        <AppCard padded={false}>
          <TriggerRow text="When network returns" done />
          <TriggerRow text="Every 5 min on Wi-Fi" done />
          <TriggerRow text="On manual Sync now" done />
          <TriggerRow text="Failed retries (max 8, 1 h max)" done last />
        </AppCard>

        <AppButton
          label="Try sync now"
          iconLeft="sync"
          onPress={() => void runSync()}
          disabled={!online || busy}
          loading={busy}
          fullWidth
          className="mt-5"
        />
      </ScrollView>
    </View>
  );
}

function CheckRow({
  icon,
  label,
  yes,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  yes: boolean;
  last?: boolean;
}) {
  return (
    <View className={['flex-row items-center px-3.5 py-3', !last ? 'border-b border-line-subtle' : ''].join(' ')}>
      <View
        className={[
          'w-7 h-7 rounded-full items-center justify-center',
          yes ? 'bg-success-soft' : 'bg-page-light dark:bg-page-dark/40',
        ].join(' ')}
      >
        <Ionicons name={icon} size={14} color={yes ? '#16A34A' : '#94A3B8'} />
      </View>
      <Text className="flex-1 ml-2.5 text-[13px] font-medium text-ink-primary-light dark:text-ink-primary-dark">
        {label}
      </Text>
      <Ionicons name={yes ? 'checkmark-circle' : 'close-circle'} size={16} color={yes ? '#16A34A' : '#94A3B8'} />
    </View>
  );
}

function TriggerRow({ text, done, last }: { text: string; done: boolean; last?: boolean }) {
  return (
    <View className={['flex-row items-center px-3.5 py-3', !last ? 'border-b border-line-subtle' : ''].join(' ')}>
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={done ? '#003B8E' : '#64748B'} />
      <Text className="flex-1 ml-2.5 text-[13px] text-ink-primary-light dark:text-ink-primary-dark">{text}</Text>
    </View>
  );
}
