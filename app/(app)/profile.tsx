import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, useRouter } from 'expo-router';
import { AppButton, AppCard, Avatar, ConfirmDialog, ListRow, OfflineBanner, SectionLabel } from '@/src/components';
import { useAuthStore } from '@/src/stores/auth';
import { useNetworkStore } from '@/src/stores/network';
import { useTheme } from '@/src/theme';

export default function ProfileScreen() {
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const manualOffline = useNetworkStore((s) => s.manualOffline);
  const toggleManualOffline = useNetworkStore((s) => s.toggleManualOffline);
  const isDark = mode === 'dark';
  const [showLogout, setShowLogout] = useState(false);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="bg-brand">
        <View className="items-center px-4 pt-4 pb-7">
          <Avatar name={user?.name ?? 'R'} tone="brand" size="xl" />
          <Text className="text-h2 font-medium text-white mt-2.5">{user?.name ?? 'Surveyor'}</Text>
          <Text className="text-caption text-white/75">
            {user?.role === 'surveyor' ? 'Surveyor' : 'Supervisor'} · {user?.ulbName ?? '—'}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <AppCard padded={false} className="mb-4">
          <InfoRow label="ULB" value={`${user?.ulbName ?? ''} (${user?.ulbCode ?? ''})`} />
          <InfoRow label="District" value={user?.districtName ?? '—'} />
          <InfoRow label="Wards" value={user?.wardAssignments.join(', ') ?? '—'} />
          <InfoRow label="User ID" value={user?.id ?? '—'} mono last />
        </AppCard>

        <SectionLabel>Preferences</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="notifications-outline"
            iconTone="brand"
            title="Notifications"
            onPress={() => router.push('/(app)/notifications' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="moon-outline"
            iconTone="neutral"
            title="Dark mode"
            rightSlot={
              <Switch
                value={isDark}
                onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="cloud-offline-outline"
            iconTone="warning"
            title="Force offline (testing)"
            rightSlot={
              <Switch
                value={manualOffline}
                onValueChange={toggleManualOffline}
                trackColor={{ false: '#E5E9F0', true: '#F59E0B' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="settings-outline"
            iconTone="brand"
            title="All settings"
            subtitle="Language, sync, capture options"
            onPress={() => router.push('/(app)/settings' as Href)}
          />
        </AppCard>

        <SectionLabel>Data & history</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="cloud-download-outline"
            iconTone="brand"
            title="Master data"
            onPress={() => router.push('/(app)/masters' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="time-outline"
            iconTone="neutral"
            title="Activity log"
            onPress={() => router.push('/(app)/activity' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="cloud-outline"
            iconTone="neutral"
            title="Offline mode info"
            onPress={() => router.push('/(app)/offline' as Href)}
          />
        </AppCard>

        <SectionLabel>Support</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="help-circle-outline"
            iconTone="brand"
            title="Help & support"
            onPress={() => router.push('/(app)/help' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="information-circle-outline"
            iconTone="neutral"
            title="About"
            onPress={() => router.push('/(app)/about' as Href)}
          />
        </AppCard>

        <AppButton
          label="Sign out"
          variant="outline"
          iconLeft="log-out-outline"
          onPress={() => setShowLogout(true)}
          fullWidth
        />
      </ScrollView>

      <ConfirmDialog
        visible={showLogout}
        title="Sign out?"
        message="You will need to sign in again on this device. Your drafts will remain saved."
        confirmLabel="Sign out"
        tone="danger"
        icon="log-out-outline"
        onConfirm={() => {
          setShowLogout(false);
          logout();
        }}
        onCancel={() => setShowLogout(false)}
      />
    </View>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <View
      className={['flex-row justify-between items-center px-3.5 py-3', !last ? 'border-b border-line-subtle' : ''].join(
        ' ',
      )}
    >
      <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark">{label}</Text>
      <Text
        numberOfLines={1}
        className={[
          'max-w-[60%] text-right text-ink-primary-light dark:text-ink-primary-dark',
          mono ? 'font-mono text-[13px]' : 'text-[13px] font-medium',
        ].join(' ')}
      >
        {value}
      </Text>
    </View>
  );
}
