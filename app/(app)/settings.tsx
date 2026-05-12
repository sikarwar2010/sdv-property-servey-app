import { AppCard, AppHeader, ListRow, RadioGroup, SectionLabel, SegmentedControl } from '@/src/components';
import { useTheme } from '@/src/theme';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

type Lang = 'en' | 'hi';
type SyncFreq = 'realtime' | '5m' | '15m' | 'manual';

export default function SettingsScreen() {
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [syncFreq, setSyncFreq] = useState<SyncFreq>('5m');
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [hdPhotos, setHdPhotos] = useState(false);
  const [autoGps, setAutoGps] = useState(true);

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <AppHeader title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <SectionLabel>Language</SectionLabel>
        <View className="mb-4">
          <SegmentedControl<Lang>
            items={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी' },
            ]}
            value={lang}
            onChange={setLang}
          />
        </View>

        <SectionLabel>Appearance</SectionLabel>
        <AppCard padded className="mb-4">
          <RadioGroup<'light' | 'dark' | 'system'>
            items={[
              { value: 'light', label: 'Light', helper: 'Best for outdoor use' },
              { value: 'dark', label: 'Dark', helper: 'Easier on the eyes at night' },
              { value: 'system', label: 'Match system', helper: 'Follow device setting' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </AppCard>

        <SectionLabel>Sync</SectionLabel>
        <AppCard padded className="mb-4">
          <Text className="text-helper text-ink-secondary-light mb-2">Auto-sync frequency</Text>
          <RadioGroup<SyncFreq>
            items={[
              { value: 'realtime', label: 'Realtime', helper: 'Upload immediately on save' },
              { value: '5m', label: 'Every 5 minutes', helper: 'Default · balances battery' },
              { value: '15m', label: 'Every 15 minutes', helper: 'Conserves battery' },
              { value: 'manual', label: 'Manual only', helper: 'Tap Sync now to upload' },
            ]}
            value={syncFreq}
            onChange={setSyncFreq}
          />
        </AppCard>

        <SectionLabel>Capture</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="camera-outline"
            iconTone="brand"
            title="High-resolution photos"
            subtitle="Slower upload · larger storage"
            rightSlot={
              <Switch
                value={hdPhotos}
                onValueChange={setHdPhotos}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="location-outline"
            iconTone="success"
            title="Auto-capture GPS"
            subtitle="When entering step 7"
            rightSlot={
              <Switch
                value={autoGps}
                onValueChange={setAutoGps}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="phone-portrait-outline"
            iconTone="neutral"
            title="Haptic feedback"
            rightSlot={
              <Switch
                value={hapticsOn}
                onValueChange={setHapticsOn}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </AppCard>

        <SectionLabel>Notifications</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="notifications-outline"
            iconTone="warning"
            title="Push notifications"
            subtitle="Sync, QC remarks, daily targets"
            rightSlot={
              <Switch
                value={notifPush}
                onValueChange={setNotifPush}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="mail-outline"
            iconTone="neutral"
            title="Email digest"
            subtitle="Daily summary at 6 PM"
            rightSlot={
              <Switch
                value={notifEmail}
                onValueChange={setNotifEmail}
                trackColor={{ false: '#E5E9F0', true: '#003B8E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </AppCard>

        <SectionLabel>Data</SectionLabel>
        <AppCard padded={false} className="mb-4">
          <ListRow
            icon="cloud-download-outline"
            iconTone="brand"
            title="Master data"
            subtitle="ULBs, wards, dropdown options"
            onPress={() => router.push('/(app)/masters' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="time-outline"
            iconTone="neutral"
            title="Activity log"
            subtitle="View recent app activity"
            onPress={() => router.push('/(app)/activity' as Href)}
          />
          <View className="h-px bg-line-subtle" />
          <ListRow
            icon="trash-outline"
            iconTone="danger"
            title="Clear cache"
            subtitle="Reset cached masters and photos"
          />
        </AppCard>

        <SectionLabel>About</SectionLabel>
        <AppCard padded={false} className="mb-2">
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
      </ScrollView>
    </View>
  );
}
