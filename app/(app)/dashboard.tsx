import { AppButton, AppCard, KpiCard, OfflineBanner, PulseDot } from '@/src/components';
import { env } from '@/src/config/env';
import { useSurveyKpi } from '@/src/hooks/use-survey-kpi';
import { useAuthStore } from '@/src/stores/auth';
import { useIsOnline } from '@/src/stores/network';
import { useSurveyStore } from '@/src/stores/survey';
import { timeOfDayGreeting } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const startDraft = useSurveyStore((s) => s.startDraft);
  const kpi = useSurveyKpi();
  const online = useIsOnline();

  const handleNewSurvey = () => {
    startDraft();
    router.push('/(app)/surveys/new' as Href);
  };

  return (
    <View className="flex-1 bg-page-light dark:bg-page-dark">
      <StatusBar style="light" />
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="bg-brand">
        <View className="px-4 pt-2 pb-7">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-helper text-white/65">{timeOfDayGreeting()}</Text>
              <Text className="text-h2 font-medium text-white mt-0.5">{user?.name ?? 'Surveyor'}</Text>
            </View>
            <View className="flex-row items-center bg-white/15 px-2.5 py-1 rounded-full">
              <PulseDot tone={online ? 'success' : 'warning'} />
              <Text className="ml-1.5 text-[11px] font-medium text-white">{online ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <Text className="text-caption text-white/60 mt-2">
            Capture property data on device → submit sends to server
          </Text>
          {__DEV__ ? (
            <Text className="text-caption text-white/50 mt-1" numberOfLines={1}>
              API: {env.apiBaseUrl}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="-mt-4"
      >
        <AppCard padded className="mb-4">
          <Text className="text-label uppercase tracking-wider font-medium text-brand mb-2.5">Field work</Text>
          <AppButton label="New property survey" iconLeft="add" onPress={handleNewSurvey} fullWidth size="md" />
          <View className="flex-row gap-2 mt-2">
            <AppButton
              label="My surveys"
              variant="secondary"
              size="md"
              className="flex-1"
              onPress={() => router.push('/(app)/surveys' as Href)}
            />
            <AppButton
              label={kpi.pending > 0 ? `Sync (${kpi.pending})` : 'Sync'}
              variant="outline"
              size="md"
              className="flex-1"
              onPress={() => router.push('/(app)/sync' as Href)}
            />
          </View>
        </AppCard>

        <Text className="text-body font-medium text-ink-primary-light dark:text-ink-primary-dark mb-2">Status</Text>
        <View className="flex-row flex-wrap -mx-0.5">
          <View className="w-1/2 p-0.5">
            <KpiCard icon="document-outline" iconColor="#475569" value={kpi.drafts} label="Drafts" />
          </View>
          <View className="w-1/2 p-0.5">
            <KpiCard icon="cloud-upload-outline" iconColor="#F59E0B" value={kpi.pending} label="To send" />
          </View>
          <View className="w-1/2 p-0.5">
            <KpiCard icon="checkmark-circle-outline" iconColor="#16A34A" value={kpi.submitted} label="On server" />
          </View>
          <View className="w-1/2 p-0.5">
            <KpiCard icon="alert-circle-outline" iconColor="#DC2626" value={kpi.failed} label="Failed" />
          </View>
        </View>

        {kpi.pending > 0 ? (
          <Pressable
            onPress={() => router.push('/(app)/sync' as Href)}
            className="flex-row items-center p-3 mt-4 rounded-xl bg-warning-soft border border-warning/30"
          >
            <View className="w-7 h-7 rounded-full bg-warning items-center justify-center">
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            </View>
            <View className="flex-1 ml-2.5">
              <Text className="text-helper font-medium text-warning-ink">
                {kpi.pending} survey{kpi.pending === 1 ? '' : 's'} waiting to send
              </Text>
              <Text className="text-caption text-warning-ink">Tap Sync to upload to server</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#92400E" />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
